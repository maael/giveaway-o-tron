import { ChatItem } from '../chat'
import { ChannelInfo } from './types'
import { getRandomArrayItem } from './misc'
import { getFollowerInfo, getUsersFromNames, getUsersSubscriptionInfo, getViewers } from './twitch'
import { Cache, CACHE_KEY } from './twitchCaches'

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  subLuck: number = 2,
  followerOnly: boolean = true,
  numberOfWinners: number = 1
) {
  console.info('COMMAND', chatCommand)
  let users = chatItems
    .filter((c) => (chatCommand ? c.msg.toLowerCase().includes(chatCommand.toLowerCase()) : true))
    .reduce<ChatItem[]>((acc, c) => (acc.some((i) => i.username === c.username) ? acc : acc.concat(c)), [])
    .flatMap((c) => (c.isSubscriber ? Array.from({ length: subLuck }, () => c) : c))
  if (followerOnly) {
    const idCache = await new Cache(channelInfo.login!, CACHE_KEY.userIds).get()
    const mappedUsers = await getUsersFromNames(
      channelInfo,
      users.map((u) => u.username),
      idCache
    )
    const followerCache = await new Cache(channelInfo.login!, CACHE_KEY.follows).get()
    users = (await getFollowerInfo(channelInfo, mappedUsers, 10, followerCache)) as any
  }

  return Array.from({ length: numberOfWinners }, () => {
    const winner = getRandomArrayItem(users)
    if (!winner) return
    return {
      username: winner.username,
      isSubscriber: winner.isSubscriber,
      id: winner.id,
    }
  }).filter(Boolean) as { username: string; isSubscriber: boolean; id: string }[]
}

export async function getInstantGiveaway(
  channelInfo: ChannelInfo,
  subLuck = 2,
  followerOnly: boolean = true,
  numberOfWinners: number = 1
) {
  let viewers = await getViewers(channelInfo)
  const idCache = await new Cache(channelInfo.login!, CACHE_KEY.userIds).get()
  const mappedUsers = await getUsersFromNames(channelInfo, viewers, idCache)
  if (followerOnly) {
    const followerCache = await new Cache(channelInfo.login!, CACHE_KEY.follows).get()
    const subCache = await new Cache(channelInfo.login!, CACHE_KEY.subs).get()
    const [withFollowers, withSub] = await Promise.all([
      getFollowerInfo(channelInfo, mappedUsers, 5, followerCache),
      getUsersSubscriptionInfo(channelInfo, mappedUsers, subCache),
    ])
    const combined: any[] = withFollowers.map((i) => {
      ;(i as any).isSubscriber = withSub.find((s) => s.id === i.id)?.isSubscriber || false
      return i
    })
    viewers = combined
      .filter((i) => i.follows)
      .flatMap((c) => (c.isSubscriber ? Array.from({ length: subLuck }, () => c) : c))
      .map((i) => i.login)
  }
  return Array.from({ length: numberOfWinners }, () => {
    const winner = getRandomArrayItem(viewers)
    if (!winner) return
    return winner
  }).filter(Boolean) as string[]
}
