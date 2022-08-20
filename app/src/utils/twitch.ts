import { ChannelInfo, ChattersApiData } from './types'
import { wait } from './misc'
import toast from 'react-hot-toast'
import { Cache, CACHE_KEY } from './twitchCaches'
import { refreshTokenFlow } from './auth'

const BOTS = ['streamelements', 'streamlabs', 'nightbot']

async function callTwitchApi(channelInfo: ChannelInfo, path: string, isRefresh: boolean = false) {
  const res = await fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: {
      Authorization: `Bearer ${channelInfo.token}`,
      'Client-ID': `${channelInfo.clientId}`,
    },
  })
  if (res.status === 401 && !isRefresh) {
    console.error('[callTwitchApi][401]')
    const data = await res.json()
    if (data.message.includes('scope')) {
      throw new Error(data.message)
    } else {
      const newwInfo = await refreshTokenFlow(channelInfo.refreshToken!)
      return callTwitchApi(newwInfo, path, true)
    }
  }
  return res
}

export async function getViewers(channelInfo: ChannelInfo) {
  return fetch(`https://discord-slash-commands.vercel.app/api/twitch-chatters?channel=${channelInfo.login}`)
    .then<ChattersApiData>((res) => res.json())
    .then((d) =>
      d.chatters.viewers
        .concat(d.chatters.moderators)
        .concat(d.chatters.vips)
        .concat(d.chatters.admins)
        .concat(d.chatters.staff)
        .concat(d.chatters.global_mods)
        .filter((n) => !BOTS.includes(n))
    )
}

interface DumbItem {
  login: string
  id: string
}

let dumbFollowersCache = new Map()
export async function getFollowers(channelInfo: ChannelInfo) {
  return genericCacher(
    'followers',
    CACHE_KEY.dumbfollows,
    channelInfo,
    'users/follows?to_id=',
    dumbFollowersCache,
    (i) => ({ id: i.from_id, login: i.from_login })
  )
}
let dumbSubscriberCache = new Map()
export async function getSubs(channelInfo: ChannelInfo) {
  return genericCacher(
    'subs',
    CACHE_KEY.dumbsubs,
    channelInfo,
    'subscriptions?broadcaster_id=',
    dumbSubscriberCache,
    (i) => ({ id: i.user_id, login: i.user_login })
  )
}

const initialized = {
  followers: false,
  subs: false,
}

async function genericCacher(
  type: string,
  cacheKey: CACHE_KEY,
  channelInfo: ChannelInfo,
  path: string,
  dumbCache: Map<any, any>,
  mapResult: (item: any) => DumbItem
) {
  const wasInitialized = !!initialized[type]
  const shouldToast = dumbCache.size === 0 && !initialized[type]
  initialized[type] = true
  try {
    let cursor = ''
    let cache = new Cache(channelInfo.login!, cacheKey)
    const existingCache = await cache.get()
    if (dumbCache.size === 0) {
      console.info(`[${type}][existing]`, existingCache.size)
      dumbCache = new Map([...existingCache])
    }
    let percentThresholdTotal = 0
    if (shouldToast) {
      toast.success(`Loading basic ${type} cache...`, { position: 'bottom-right' })
    }
    do {
      const data = await callTwitchApi(channelInfo, `${path}${channelInfo.userId}&first=100&after=${cursor}`).then(
        (r) => r.json()
      )
      if (!Array.isArray(data.data)) {
        console.info(`[${type}][expected-data]`, data)
        throw new Error('Unexpected API data')
      }
      const chunk: DumbItem[] = data.data.map(mapResult)
      const chunkInCachePercent =
        chunk.filter((i) => dumbCache.has(i.id) || dumbCache.has(i.login)).length / chunk.length
      const originalActualSize = dumbCache.size / 2
      chunk.forEach((c) => {
        dumbCache.set(c.id, c.login)
        dumbCache.set(c.login, c.id)
      })
      await cache.store(dumbCache)
      const actualSize = dumbCache.size / 2
      const foundSeenPages = chunkInCachePercent > 0.5
      const rightTotalish = actualSize >= data.total
      const isCatchingUp = foundSeenPages && !rightTotalish
      if ((foundSeenPages && !wasInitialized && rightTotalish) || (foundSeenPages && wasInitialized)) {
        console.info(`[${type}]`, '[caught-up]', { chunkInCachePercent, newItems: data.total - originalActualSize })
        break
      }
      if (cursor === data.pagination.cursor) {
        throw Error('This is nonsense')
      }
      cursor = data.pagination.cursor
      const percentThreshold = Math.floor(((actualSize / data.total) * 100) / 10)
      const percent = ((actualSize / data.total) * 100).toFixed(0)
      const timeEstimate = `~${(((data.total - actualSize) / 100) * 400) / 1000}s remaining`
      if (percentThreshold !== percentThresholdTotal) {
        percentThresholdTotal = percentThreshold
        if (shouldToast) {
          if (isCatchingUp) {
            toast.success(`Basic ${type} cache catching up, was at ${percent}% done`, {
              position: 'bottom-right',
            })
          } else {
            toast.success(`Basic ${type} cache ${percent}% done, ${timeEstimate}`, {
              position: 'bottom-right',
            })
          }
        }
      }
      console.info(`[${type}]`, `${percent}%`, timeEstimate)
      if (cursor) await wait(100)
    } while (cursor)
    if (shouldToast) toast.success(`Basic ${type} cache done!`, { position: 'bottom-right' })
    return dumbCache
  } catch (e) {
    console.error(`[${type}]`, e)
    if (shouldToast) toast.error(`Failed to load basic ${type} cache!`, { position: 'bottom-right' })
    return dumbCache
  }
}
