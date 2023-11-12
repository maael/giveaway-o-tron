import toast from 'react-hot-toast'
import { wait } from './misc'
import { ChannelInfo } from './types'
import { Cache, CACHE_KEY } from './cache'
import { cacheEmitter } from './cacheStats'
import { YOUTUBE_STORAGE_KEYS } from './google'

const initialized = {
  twitchfollowers: false,
  twitchsubs: false,
  youtubefollowers: false,
  youtubesubs: false,
}

type CacheFetchResult = {
  data: {}[]
  total: number
  pagination: {
    cursor: string
  }
}

interface DumbItem {
  login: string
  id: string
}

type LimitedChannelInfo = Pick<ChannelInfo, 'token' | 'refreshToken' | 'login'>

export async function genericCacher(
  platform: 'twitch' | 'youtube',
  type: 'subs' | 'followers',
  cacheKey: CACHE_KEY,
  channelInfo: LimitedChannelInfo,
  path: string,
  dumbCache: Map<any, any>,
  mapResult: (item: any) => DumbItem,
  getItems: (channelInfo: ChannelInfo, url: string, cursor: string) => Promise<CacheFetchResult>,
  delay: number = 100,
  force: boolean = false
) {
  const initialiseKey = `${platform}${type}`
  const wasInitialized = !!initialized[initialiseKey]
  const shouldToast = dumbCache.size === 0 && !initialized[initialiseKey]
  initialized[initialiseKey] = true
  let total = 0
  try {
    let cursor = ''
    let cache = new Cache(platform, channelInfo.login!, cacheKey)
    const existingCache = await cache.get()
    if (dumbCache.size === 0) {
      console.info(`[${platform}][${type}][existing]`, existingCache.size)
      dumbCache = new Map([...existingCache])
    }
    if (shouldToast) {
      toast.success(`Loading ${platform} ${type}...`, {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
    }
    do {
      const data: CacheFetchResult = await getItems(channelInfo, path, cursor)
      if (!Array.isArray(data.data)) {
        console.info(`[${platform}][${type}][expected-data]`, data)
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
      if (force) {
        console.info(`[${platform}][${type}]`, '[forcing]')
      } else if ((foundSeenPages && !wasInitialized && rightTotalish) || (foundSeenPages && wasInitialized)) {
        console.info(`[${platform}][${type}]`, '[caught-up]', {
          chunkInCachePercent,
          newItems: data.total - originalActualSize,
        })
        break
      }
      if (cursor === data.pagination.cursor) {
        throw Error('This is nonsense')
      }
      cursor = data.pagination.cursor
      total = data.total
      cacheEmitter.emit({
        type: `${platform}${type}`,
        total,
        count: Math.floor(dumbCache.size / 2),
        status: 'inprogress',
        lastUpdated: new Date(),
      })
      let selectedDelay = delay
      if (platform === 'youtube' && type === 'followers' && force) {
        console.warn(`[${platform}][${type}]`, 'Forcing Youtube subscribers cache')
        selectedDelay = 10_000
      }
      if (cursor) {
        await wait(selectedDelay)
      } else {
        console.info(`[${platform}][${type}]`, 'No cursor remaining', { selectedDelay })
      }
    } while (cursor)
    if (shouldToast)
      toast.success(`Loaded ${platform} ${type}!`, {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
    cacheEmitter.emit({
      type: `${platform}${type}`,
      total,
      count: Math.floor(dumbCache.size / 2),
      status: 'done',
      lastUpdated: new Date(),
    })
    return dumbCache
  } catch (e) {
    console.error(`[${platform}][${type}]`, e)
    cacheEmitter.emit({
      type: `${platform}${type}`,
      total,
      count: Math.floor(dumbCache.size / 2),
      status: 'error',
      lastUpdated: new Date(),
    })
    if (shouldToast)
      toast.error(`Failed to load ${platform} ${type}!`, {
        position: 'bottom-right',
        style: { fontSize: '0.8rem', padding: '0.2rem' },
      })
    return dumbCache
  }
}
