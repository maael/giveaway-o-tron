import toast from 'react-hot-toast'
import { chatEmitter, ChatItem } from '~/chat'
import { getFollowerInfo, getUsersFromNames, getUsersSubscriptionInfo, getViewers } from './twitch'
import { ChannelInfo } from './types'

export enum CACHE_KEY {
  userIds = 'userIds',
  subs = 'subs',
  follows = 'follows',
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
      clearInterval(interval)
      const caches = {
        userIds: new Cache(channelInfo.login!, CACHE_KEY.userIds),
        subs: new Cache(channelInfo.login!, CACHE_KEY.subs),
        follows: new Cache(channelInfo.login!, CACHE_KEY.follows),
      }
      void start(caches, channelInfo)
      const initialUserIds = await caches.userIds.get()
      chatEmitter.addEventListener('chat', async (data: CustomEvent<ChatItem>) => {
        const id = await initialUserIds.get(data.detail.username)
        if (!id) return
        console.info('[twitchCache][chat][sub]', id, data.detail.isSubscriber)
        const initialSubs = await caches.subs.get()
        await initialSubs.set(id, data.detail.isSubscriber)
      })
    }
  }, 2000)
}

async function start(caches: { [k: string]: Cache }, channelInfo: ChannelInfo) {
  console.info('[twitchCache][start]', caches)
  const viewers = await getViewers(channelInfo)
  const initialUserIds = await caches.userIds.get()
  console.info('[twitchCache][viewers]', viewers.length, initialUserIds.size)
  let total = 0
  const mappedUsers = await getUsersFromNames(channelInfo, viewers, initialUserIds, async (data) => {
    data.forEach((d) => initialUserIds.set(d.login, d.id))
    await caches.userIds.store(initialUserIds)
    total += data.length
    console.info('[twitchCache][userId]', total, 'stored of', viewers.length, `(${(total / viewers.length) * 100})%`)
  })
  console.info('[twitchCache][userIds][done]')
  await Promise.all([buildFollowers(caches, channelInfo, mappedUsers), buildSubs(caches, channelInfo, mappedUsers)])
  console.info('[twitchCache][done]')
  try {
    toast.success('Done building Twitch cache!', { position: 'bottom-center' })
  } catch (e) {
    console.error(e)
  }
}

async function buildFollowers(caches: { [k: string]: Cache }, channelInfo: ChannelInfo, mappedUsers: any) {
  const initialFollowers = await caches.follows.get()
  console.info('[twitchCache][followers][start]', { initial: initialFollowers.size, toGet: mappedUsers.length })
  let total = 0
  await getFollowerInfo(channelInfo, mappedUsers, 5, initialFollowers, async (data) => {
    data.forEach((d) => initialFollowers.set(d.id, d.follows))
    await caches.follows.store(initialFollowers)
    total += data.length
    console.info(
      '[twitchCache][followers]',
      total,
      'stored of',
      mappedUsers.length,
      `(${(total / mappedUsers.length) * 100})%`
    )
  })
  console.info('[twitchCache][followers][done]')
}

async function buildSubs(caches: { [k: string]: Cache }, channelInfo: ChannelInfo, mappedUsers: any) {
  if (channelInfo.userId === '69496551') return
  const initial = await caches.subs.get()
  console.info('[twitchCache][subs][start]', { initial: initial.size, toGet: mappedUsers.length })
  let total = 0
  await getUsersSubscriptionInfo(channelInfo, mappedUsers, initial, async (data) => {
    data.forEach((d) => initial.set(d.id, d.isSubscriber))
    await caches.subs.store(initial)
    total += data.length
    console.info(
      '[twitchCache][subs]',
      total,
      'stored of',
      mappedUsers.length,
      `(${(total / mappedUsers.length) * 100})%`
    )
  })
  console.info('[twitchCache][subs][done]')
}
