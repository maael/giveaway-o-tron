import React, { Dispatch, SetStateAction } from 'react'
import format from 'date-fns/format'
import useStorage from '../components/hooks/useStorage'

interface CacheEvent {
  type: 'twitchfollowers' | 'twitchsubs' | 'youtubefollowers' | 'youtubesubs'
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

export const cacheEmitter = new CacheEvents()

export interface CacheStats {
  twitchfollowers: Omit<CacheEvent, 'type'>
  twitchsubs: Omit<CacheEvent, 'type'>
  youtubefollowers: Omit<CacheEvent, 'type'>
  youtubesubs: Omit<CacheEvent, 'type'>
}

export function useCacheStats() {
  const [stats, setStats] = React.useState<CacheStats>({
    twitchfollowers: { count: 0, total: 0, status: 'inprogress', lastUpdated: null },
    twitchsubs: { count: 0, total: 0, status: 'inprogress', lastUpdated: null },
    youtubefollowers: { count: 0, total: 0, status: 'inprogress', lastUpdated: null },
    youtubesubs: { count: 0, total: 0, status: 'inprogress', lastUpdated: null },
  })
  React.useEffect(() => {
    function handle(e) {
      const data: CacheEvent = e.detail
      console.info('[cache:event]', data)
      setStats((s) => ({
        ...s,
        [data.type]: {
          count: isNaN(data.count) ? 0 : data.count,
          total: isNaN(data.total) ? 0 : data.total,
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
  twitchFollowers: CacheHistoryItem[]
  twitchSubs: CacheHistoryItem[]
  youtubeFollowers: CacheHistoryItem[]
  youtubeSubs: CacheHistoryItem[]
}
export function useCacheHistory(stats: CacheStats): CacheHistory {
  const [twitchFollowerHistory, setTwitchFollowerHistory] = useStorage<
    { count: number; time: string; fullTime: string; name: string }[]
  >('followershistory', [])
  const [twitchSubsHistory, setTwitchSubsHistory] = useStorage<
    { count: number; time: string; fullTime: string; name: string }[]
  >('subshistory', [])
  const [youtubeFollowerHistory, setYoutubeFollowerHistory] = useStorage<
    { count: number; time: string; fullTime: string; name: string }[]
  >('youtubefollowershistory', [])
  const [youtubeSubsHistory, setYoutubeSubsHistory] = useStorage<
    { count: number; time: string; fullTime: string; name: string }[]
  >('youtubesubshistory', [])
  useSyncStats(stats.twitchfollowers, setTwitchFollowerHistory)
  useSyncStats(stats.twitchsubs, setTwitchSubsHistory)
  useSyncStats(stats.youtubefollowers, setYoutubeFollowerHistory)
  useSyncStats(stats.youtubesubs, setYoutubeSubsHistory)
  return {
    twitchFollowers: twitchFollowerHistory,
    twitchSubs: twitchSubsHistory,
    youtubeFollowers: youtubeFollowerHistory,
    youtubeSubs: youtubeSubsHistory,
  }
}

function useSyncStats(stat: any, update: Dispatch<SetStateAction<any[]>>) {
  React.useEffect(() => {
    if (!stat.lastUpdated) return
    const ts = new Date()
    update((h) =>
      h
        .concat({
          count: stat.count || 0,
          time: format(ts, 'HH:mm'),
          fullTime: format(ts, 'dd/MM HH:mm'),
          name: ts.toISOString(),
        })
        .slice(-100)
    )
  }, [stat.lastUpdated])
}
