import { ChatItem } from '../chat'
import { ChannelInfo, ChattersApiData } from './types'
import { getRandomArrayItem } from './misc'
import { getFollowerInfo, getUsersFromNames, getUsersSubscriptionInfo, getViewers } from './twitch'

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  subLuck: number = 2,
  followerOnly: boolean = true,
  numberOfWinners: number = 1
) {
  let users = chatItems
    .filter((c) => (chatCommand ? c.msg.toLowerCase().includes(chatCommand.toLowerCase()) : true))
    .reduce<ChatItem[]>((acc, c) => (acc.some((i) => i.username === c.username) ? acc : acc.concat(c)), [])
    .flatMap((c) => (c.isSubscriber ? Array.from({ length: subLuck }, () => c) : c))
  if (followerOnly) {
    const mappedUsers = await getUsersFromNames(
      channelInfo,
      users.map((u) => u.username)
    )
    users = (await getFollowerInfo(channelInfo, mappedUsers)) as any
  }

  return Array.from({ length: numberOfWinners }, () => {
    const winner = getRandomArrayItem(users)
    return {
      username: winner.username,
      isSubscriber: winner.isSubscriber,
      id: winner.id,
    }
  })
}

export async function getInstantGiveaway(
  channelInfo: ChannelInfo,
  subLuck = 2,
  followerOnly: boolean = true,
  numberOfWinners: number = 1
) {
  let viewers = await getViewers(channelInfo)
  if (followerOnly) {
    const mappedUsers = await getUsersFromNames(channelInfo, viewers)
    const [withFollowers, withSub] = await Promise.all([
      getFollowerInfo(channelInfo, mappedUsers, 5),
      getUsersSubscriptionInfo(channelInfo, mappedUsers),
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
  return Array.from({ length: numberOfWinners }, () => getRandomArrayItem(viewers))
}
