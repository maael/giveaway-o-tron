import { ChannelInfo, ChattersApiData } from './types'
import { wait } from './misc'
import toast from 'react-hot-toast'
import { Cache, CACHE_KEY } from './twitchCaches'
import { refreshTokenFlow } from './auth'
import React from 'react'
import format from 'date-fns/format'
import useStorage from '../components/hooks/useStorage'

const BOTS = ['streamelements', 'streamlabs', 'nightbot']

interface CacheEvent {
  type: 'followers' | 'subs'
  total: number
  count: number
  status: 'inprogress' | 'done' | 'error'
  lastUpdated: Date | null
}
class CacheEvents extends EventTarget {
  emit(data: CacheEvent) {
    this.dispatchEvent(new CustomEvent('update', { detail: data }))
  }
}

const cacheEmitter = new CacheEvents()

export interface CacheStats {
  followers: Omit<CacheEvent, 'type'>
  subs: Omit<CacheEvent, 'type'>
}

export function useCacheStats() {
  const [stats, setStats] = React.useState<CacheStats>({
    followers: { count: 0, total: 0, status: 'inprogress', lastUpdated: null },
    subs: { count: 0, total: 0, status: 'inprogress', lastUpdated: null },
  })
  React.useEffect(() => {
    function handle(e) {
      const data: CacheEvent = e.detail
      console.info('[cache:event]', data)
      setStats((s) => ({
        ...s,
        [data.type]: {
          count: data.count,
          total: data.total,
          status: data.status,
          lastUpdated: data.status !== 'done' ? s[data.type].lastUpdated : data.lastUpdated,
        },
      }))
    }
    cacheEmitter.addEventListener('update', handle)
    return () => {
      cacheEmitter.removeEventListener('update', handle)
    }
  }, [setStats])
  return stats
}

interface CacheHistoryItem {
  count: number
  time: string
  fullTime: string
  name: string
}
export interface CacheHistory {
  followers: CacheHistoryItem[]
  subs: CacheHistoryItem[]
}
export function useCacheHistory(stats: CacheStats): CacheHistory {
  const [followerHistory, setFollowerHistory] = useStorage<
    { count: number; time: string; fullTime: string; name: string }[]
  >('followershistory', [])
  const [subsHistory, setSubsHistory] = useStorage<{ count: number; time: string; fullTime: string; name: string }[]>(
    'subshistory',
    []
  )
  React.useEffect(() => {
    if (!stats.followers.lastUpdated) return
    const ts = new Date()
    setFollowerHistory((h) =>
      h.concat({
        count: stats.followers.count || 0,
        time: format(ts, 'hh:mm'),
        fullTime: format(ts, 'dd/MM hh:mm'),
        name: ts.toISOString(),
      })
    )
  }, [stats.followers.lastUpdated])
  React.useEffect(() => {
    if (!stats.subs.lastUpdated) return
    const ts = new Date()
    setSubsHistory((h) =>
      h.concat({
        count: stats.subs.count || 0,
        time: format(ts, 'hh:mm'),
        fullTime: format(ts, 'dd/MM hh:mm'),
        name: ts.toISOString(),
      })
    )
  }, [stats.subs.lastUpdated])
  return { followers: followerHistory, subs: subsHistory }
}

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
  type: 'subs' | 'followers',
  cacheKey: CACHE_KEY,
  channelInfo: ChannelInfo,
  path: string,
  dumbCache: Map<any, any>,
  mapResult: (item: any) => DumbItem
) {
  const wasInitialized = !!initialized[type]
  const shouldToast = dumbCache.size === 0 && !initialized[type]
  initialized[type] = true
  let total = 0
  try {
    let cursor = ''
    let cache = new Cache(channelInfo.login!, cacheKey)
    const existingCache = await cache.get()
    if (dumbCache.size === 0) {
      console.info(`[${type}][existing]`, existingCache.size)
      dumbCache = new Map([...existingCache])
    }
    if (shouldToast) {
      toast.success(`Loading ${type}...`, {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
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
      if ((foundSeenPages && !wasInitialized && rightTotalish) || (foundSeenPages && wasInitialized)) {
        console.info(`[${type}]`, '[caught-up]', { chunkInCachePercent, newItems: data.total - originalActualSize })
        break
      }
      if (cursor === data.pagination.cursor) {
        throw Error('This is nonsense')
      }
      cursor = data.pagination.cursor
      total = data.total
      cacheEmitter.emit({
        type,
        total,
        count: Math.floor(dumbCache.size / 2),
        status: 'inprogress',
        lastUpdated: new Date(),
      })
      if (cursor) await wait(100)
    } while (cursor)
    if (shouldToast)
      toast.success(`Loaded ${type}!`, {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
    cacheEmitter.emit({ type, total, count: Math.floor(dumbCache.size / 2), status: 'done', lastUpdated: new Date() })
    return dumbCache
  } catch (e) {
    console.error(`[${type}]`, e)
    cacheEmitter.emit({ type, total, count: Math.floor(dumbCache.size / 2), status: 'error', lastUpdated: new Date() })
    if (shouldToast)
      toast.error(`Failed to load ${type}!`, {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
    return dumbCache
  }
}
