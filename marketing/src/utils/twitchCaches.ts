import toast from 'react-hot-toast'
import { validateToken } from './auth'
import { wait } from './misc'
import { getSubs, getFollowers } from './twitch'
import { ChannelInfo } from './types'
import { store as dataStore } from './storage'

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
      console.info('[twitchCache][validateToken]')
      await validateToken(channelInfo.token!, channelInfo.refreshToken!)
      const freshChannelInfo = await dataStore.getItem<ChannelInfo>('main-channelInfo')
      clearInterval(interval)
      startTwitchPollingData(freshChannelInfo!, true)
    }
  }, 5_000)
}

async function startTwitchPollingData(channelInfo: ChannelInfo, first: boolean = false) {
  await Promise.all([getFollowers(channelInfo), getSubs(channelInfo)])
  toast.success(`${first ? 'Loaded twitch initial data, ready' : 'Updated twitch data'}!`, {
    position: 'bottom-right',
    style: { fontSize: '0.8rem', padding: '0.2rem' },
    duration: 3000,
  })
  console.info('[poll][done]')
  await wait(60_000 * 3)
  await startTwitchPollingData(channelInfo)
}
