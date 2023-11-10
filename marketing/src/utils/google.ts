import { getSession, getYoutubeRefresh } from '~/components/hooks/useSession'
import { wait } from './misc'
import { genericCacher } from './cacher'
import { CACHE_KEY } from './cache'
import { ChannelInfo } from './types'
import { toast } from 'react-hot-toast'

let notifiedOnMembersIssue = false
export const safeYoutubeFetch: typeof fetch = async (input, init) => {
  const request = await fetch(input, init)
  if (request.status === 409 || request.status === 401) {
    console.info('[youtube][refresh]', getYoutubeRefresh())
    const newTokens = await fetch('/api/auth/refresh/youtube', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        refreshToken: getYoutubeRefresh(),
      }),
    }).then((r) => r.json())
    console.info('[youtube] Refresh tokens', newTokens)
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
      console.info('[youtube] Insufficient scopes', data)
      if (!notifiedOnMembersIssue) {
        toast.error("Sorry, you don't seem to be able to have members", {
          position: 'bottom-right',
        })
      }
      notifiedOnMembersIssue = true
      // window.location.href = '/api/auth/google'
    } else {
      console.info('[youtube] Rate limited, waiting')
      toast.error('Sorry, rate limited by Youtube, trying again later', {
        position: 'bottom-right',
      })
      await wait(60_000)
      console.info('[youtube] Rate limited, waited')
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
  const result = await safeYoutubeFetch(`${YOUTUBE_URLS[type]}${cursor ? `&pageToken=${cursor}` : ''}`, {
    headers: {
      Authorization: `Bearer ${channelInfo.token}`,
    },
  }).then((r) => r.json())

  console.info('[youtube]', type, result)

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
  let delay = 60_000
  if (window.location.search.includes('forceYoutube')) {
    console.warn('[youtube] Forcing Youtube subscribers cache')
    delay = 10_000
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
    delay
  )
  if (maxTime) {
    return Promise.race([cacherPromise, racedCache(maxTime, youtubeSubscribersCache)])
  }
  return cacherPromise
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
