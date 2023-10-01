import toast from 'react-hot-toast'
import { validateToken } from './auth'
import { wait } from './misc'
import { getSubs, getFollowers } from './twitch'
import { ChannelInfo } from './types'
import { store as dataStore } from './storage'

export enum CACHE_KEY {
  dumbfollows = 'dumbfollows',
  dumbsubs = 'dumbsubs',
}

export class Cache {
  key: `${string}-${CACHE_KEY}`

  constructor(channel: string, key: CACHE_KEY) {
    this.key = `${channel}-${key}`
  }

  get = async function get() {
    try {
      return new Map((await dataStore.getItem<any[]>(this.key)) || [])
    } catch (e) {
      console.info('[CACHE][ERROR]', this.key, e)
      return new Map()
    }
  }

  store = async function store(data: Map<any, any>) {
    await dataStore.setItem(
      this.key,
      [...data].filter((d) => d[0] !== null)
    )
  }
}

export default async function watch() {
  if (typeof window === 'undefined') {
    console.info('[twitchCache] On server, skipping')
    return
  }
  const interval = setInterval(async () => {
    console.info('[twitchCache][check]')
    const channelInfo = await dataStore.getItem<ChannelInfo>('main-channelInfo')
    if (channelInfo) {
      if (!channelInfo.login) return
      await validateToken(channelInfo.token!, channelInfo.refreshToken!)
      const freshChannelInfo = await dataStore.getItem<ChannelInfo>('main-channelInfo')
      clearInterval(interval)
      startPollingData(freshChannelInfo!, true)
    }
  }, 5_000)
}

async function startPollingData(channelInfo: ChannelInfo, first: boolean = false) {
  await Promise.all([getFollowers(channelInfo), getSubs(channelInfo)])
  toast.success(`${first ? 'Loaded initial data, ready' : 'Updated'}!`, {
    position: 'bottom-right',
    style: { fontSize: '0.8rem', padding: '0.2rem' },
    duration: 3000,
  })
  console.info('[poll][done]')
  await wait(60_000 * 3)
  await startPollingData(channelInfo)
}
