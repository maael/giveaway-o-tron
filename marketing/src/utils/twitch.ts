import { ChannelInfo, ChattersApiData } from './types'
import { CACHE_KEY } from './cache'
import { refreshTokenFlow } from './auth'
import { genericCacher } from './cacher'

const BOTS = ['streamelements', 'streamlabs', 'nightbot']

async function callWithInfo(base: string, channelInfo: ChannelInfo, path: string, isRefresh: boolean = false) {
  const res = await fetch(`${base}${path}`, {
    headers: {
      Authorization: `Bearer ${channelInfo.token}`,
      'Client-ID': `${channelInfo.clientId}`,
    },
  })
  if (res.status === 401 && !isRefresh) {
    console.error('[callWithInfo][401]')
    const data = await res.json()
    if (data.message.includes('scope')) {
      throw new Error(data.message)
    } else {
      const newInfo = await refreshTokenFlow(channelInfo.refreshToken!)
      return callWithInfo(base, newInfo, path, true)
    }
  }
  return res
}

async function callTwitchApi(channelInfo: ChannelInfo, path: string, isRefresh: boolean = false) {
  return callWithInfo('https://api.twitch.tv/helix/', channelInfo, path, isRefresh)
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

let dumbFollowersCache = new Map()
export async function getFollowers(channelInfo: ChannelInfo) {
  return genericCacher(
    'twitch',
    'followers',
    CACHE_KEY.dumbfollows,
    channelInfo,
    'channels/followers?broadcaster_id=',
    dumbFollowersCache,
    (i) => ({ id: i.user_id, login: i.user_login }),
    getTwitchItems
  )
}

let dumbSubscriberCache = new Map()
export async function getSubs(channelInfo: ChannelInfo) {
  return genericCacher(
    'twitch',
    'subs',
    CACHE_KEY.dumbsubs,
    channelInfo,
    'subscriptions?broadcaster_id=',
    dumbSubscriberCache,
    (i) => ({ id: i.user_id, login: i.user_login }),
    getTwitchItems
  )
}

async function getTwitchItems(channelInfo: ChannelInfo, url: string, cursor: string) {
  return callTwitchApi(channelInfo, `${url}${channelInfo.userId}&first=100&after=${cursor}`).then((r) => r.json())
}
