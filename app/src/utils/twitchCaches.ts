import toast from 'react-hot-toast'
import { validateToken } from './auth'
import { wait } from './misc'
import { getSubs, getFollowers } from './twitch'
import { ChannelInfo } from './types'

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
      return new Map(JSON.parse(await Neutralino.storage.getData(this.key)))
    } catch (e) {
      console.info('[CACHE][ERROR]', this.key, e)
      return new Map()
    }
  }

  store = async function store(data: Map<any, any>) {
    await Neutralino.storage.setData(this.key, JSON.stringify([...data]))
  }
}

export default async function watch() {
  const interval = setInterval(async () => {
    console.info('[twitchCache][check]')
    const info = await Neutralino.storage.getData('main-channelInfo')
    if (info) {
      const channelInfo = JSON.parse(info) as ChannelInfo
      if (!channelInfo.login) return
      await validateToken(channelInfo.token!, channelInfo.refreshToken!)
      const freshInfo = await Neutralino.storage.getData('main-channelInfo')
      const freshChannelInfo = JSON.parse(freshInfo) as ChannelInfo
      console.info('what', freshChannelInfo)
      clearInterval(interval)
      startPollingData(freshChannelInfo, true)
    }
  }, 2000)
}

async function startPollingData(channelInfo: ChannelInfo, first: boolean = false) {
  await Promise.all([getFollowers(channelInfo), getSubs(channelInfo)])
  toast.success(`${first ? 'Finished' : 'Updated'} Twitch caches, ready!`, { position: 'bottom-right' })
  await wait(60_000)
  await startPollingData(channelInfo)
}
