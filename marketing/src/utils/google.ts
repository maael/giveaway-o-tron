import { getSession, getYoutubeRefresh } from '~/components/hooks/useSession'
import { wait } from './misc'
import { genericCacher } from './cacher'
import { CACHE_KEY } from './cache'
import { ChannelInfo } from './types'
import { toast } from 'react-hot-toast'

export enum YOUTUBE_STORAGE_KEYS {
  ForceSubs = 'giveaway-youtube-force-subscriptions/v1',
  LastSubKey = 'giveaway-youtube-last-subscriptions/v1',
  TimerStart = 'giveaway-youtube-timer-start/v1',
}

let notifiedOnMembersIssue = false
export const safeYoutubeFetch: typeof fetch = async (input, init) => {
  const request = await fetch(input, init)
  if (request.status === 409 || request.status === 401) {
    const newTokens = await fetch('/api/auth/refresh/youtube', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        refreshToken: getYoutubeRefresh(),
      }),
    }).then((r) => r.json())
    console.info('[youtube][refresh][new]', newTokens)
    return safeYoutubeFetch(input, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${newTokens.access_token}` },
    })
  } else if (request.status === 403) {
    const data = await request
      .clone()
      .json()
      .catch((e) => {
        console.info('[youtube][error] Failed to get 403 body', e)
        return null
      })
    if (data?.error?.message?.includes('scopes')) {
      console.info('[youtube][error][scopes] Insufficient scopes', data?.error)
      if (!notifiedOnMembersIssue) {
        toast.error("Sorry, you don't seem to be able to have members", {
          position: 'bottom-right',
          style: { fontSize: '0.8rem', padding: '0.2rem' },
        })
      }
      notifiedOnMembersIssue = true
      // window.location.href = '/api/auth/google'
    } else {
      console.info('[youtube][rate-limit] Waiting')
      toast.error('Sorry, rate limited by Youtube, trying again later', {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
      await wait(60_000)
      console.info('[youtube][rate-limit] Waited')
      return safeYoutubeFetch(input, init)
    }
  }
  return request
}

const YOUTUBE_URLS = {
  members: 'https://www.googleapis.com/youtube/v3/members?part=snippet&maxResults=1000&mode=all_current',
  subscribers:
    'https://www.googleapis.com/youtube/v3/subscriptions?part=subscriberSnippet&maxResults=50&myRecentSubscribers=true',
}

async function getYoutubeItems(channelInfo: ChannelInfo, type: string, cursor: string) {
  let pageToken = cursor
  let url: string = YOUTUBE_URLS[type]

  if (type === 'subscribers' && !pageToken && localStorage.getItem(YOUTUBE_STORAGE_KEYS.ForceSubs)) {
    pageToken = localStorage.getItem(YOUTUBE_STORAGE_KEYS.LastSubKey) || cursor
    url = url.replace('myRecentSubscribers', 'mySubscribers')
  }

  const result = await safeYoutubeFetch(`${url}${pageToken ? `&pageToken=${pageToken}` : ''}`, {
    headers: {
      Authorization: `Bearer ${channelInfo.token}`,
    },
  }).then((r) => r.json())

  console.info('[youtube][get-items]', type, result, pageToken)

  if (type === 'subscribers' && result?.nextPageToken) {
    localStorage.setItem(YOUTUBE_STORAGE_KEYS.LastSubKey, result?.nextPageToken)
  }

  return {
    data: result?.items || [],
    pagination: {
      cursor: result?.nextPageToken,
    },
    total: result?.pageInfo?.totalResults,
  }
}

async function racedCache(maxTime: number, cache: Map<any, any>) {
  await wait(maxTime)
  return cache
}

let youtubeMembersCache = new Map()
export async function getYoutubeMembers(
  youtubeSession?: Exclude<ReturnType<typeof getSession>, undefined>['youtube'],
  maxTime?: number
) {
  let session = youtubeSession
  if (!session) {
    session = getSession()?.youtube
  }
  if (!session) {
    console.warn(`[youtube][members][cache] No session, exiting`)
    return youtubeMembersCache
  }
  const fakeChannelInfo: ChannelInfo = {
    token: youtubeSession?.accessToken,
    refreshToken: youtubeSession?.refreshToken,
    login: youtubeSession?.username,
    userId: youtubeSession?.id,
  }
  const cacherPromise = genericCacher(
    'youtube',
    'subs',
    CACHE_KEY.dumbsubs,
    fakeChannelInfo,
    'members',
    youtubeMembersCache,
    (i) => ({ id: i?.snippet?.memberDetails?.displayName, login: i?.snippet?.memberDetails?.channelId }),
    getYoutubeItems,
    60_000
  )
  if (maxTime) {
    return Promise.race([cacherPromise, racedCache(maxTime, youtubeMembersCache)])
  }
  return cacherPromise
}

let youtubeSubscribersCache = new Map()
export async function getYoutubeSubscribers(
  youtubeSession?: Exclude<ReturnType<typeof getSession>, undefined>['youtube'],
  maxTime?: number
) {
  let session = youtubeSession
  if (!session) {
    session = getSession()?.youtube
  }
  if (!session) {
    console.warn(`[youtube][subs][cache] No session, exiting`)
    return youtubeSubscribersCache
  }
  const fakeChannelInfo: ChannelInfo = {
    token: youtubeSession?.accessToken,
    refreshToken: youtubeSession?.refreshToken,
    login: youtubeSession?.username,
    userId: youtubeSession?.id,
  }

  const cacherPromise = genericCacher(
    'youtube',
    'followers',
    CACHE_KEY.dumbfollows,
    fakeChannelInfo,
    'subscribers',
    youtubeSubscribersCache,
    (i) => ({ id: i?.subscriberSnippet?.channelId, login: i?.subscriberSnippet?.title }),
    getYoutubeItems,
    60_000,
    !!localStorage.getItem(YOUTUBE_STORAGE_KEYS.ForceSubs)
  )
  if (maxTime) {
    return Promise.race([cacherPromise, racedCache(maxTime, youtubeSubscribersCache)]).then(() => {
      if (!maxTime) {
        localStorage.removeItem(YOUTUBE_STORAGE_KEYS.ForceSubs)
        localStorage.removeItem(YOUTUBE_STORAGE_KEYS.LastSubKey)
      }
    })
  }
  return cacherPromise.then(() => {
    if (!maxTime) {
      localStorage.removeItem(YOUTUBE_STORAGE_KEYS.ForceSubs)
      localStorage.removeItem(YOUTUBE_STORAGE_KEYS.LastSubKey)
    }
  })
}

export default async function watch() {
  if (typeof window === 'undefined') {
    console.info('[youtube][cache] On server, skipping')
    return
  }
  startYoutubeData(true)
}

async function startYoutubeData(first: boolean = false) {
  const youtubeSession = getSession()?.youtube
  if (youtubeSession) {
    await Promise.all([getYoutubeMembers(youtubeSession), getYoutubeSubscribers(youtubeSession)])
    toast.success(`${first ? 'Loaded youtube initial data, ready' : 'Updated youtube data'}!`, {
      position: 'bottom-right',
      style: { fontSize: '0.8rem', padding: '0.2rem' },
      duration: 3000,
    })
    console.info('[youtube][poll][done]')
  }
  await wait(60_000 * 5)
  await startYoutubeData()
}
