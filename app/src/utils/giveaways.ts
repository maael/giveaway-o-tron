import { ChatItem } from '../chat'
import { ChannelInfo } from './types'
import { getRandomArrayItem } from './misc'
import { getFollowers, getSubs, getViewers } from './twitch'

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  subLuck: number = 2,
  followerOnly: boolean = true,
  numberOfWinners: number = 1
) {
  console.info('[giveaway][chat][start]')
  let users = chatItems
    .filter((c) => (chatCommand ? c.msg.toLowerCase().includes(chatCommand.toLowerCase()) : true))
    .reduce<ChatItem[]>((acc, c) => (acc.some((i) => i.username === c.username) ? acc : acc.concat(c)), [])
    .flatMap((c) => (c.isSubscriber ? Array.from({ length: subLuck }, () => c) : c))
  if (followerOnly) {
    const followers = await getFollowers(channelInfo)
    users = users.filter((u) => followers.has(u.username))
  }

  console.info('[giveaway][chat][end]')
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
  console.info('[giveaway][instant][start]')
  let viewers = await getViewers(channelInfo)
  console.info({ viewers: viewers.length })
  if (followerOnly) {
    const [followersList, subsList] = await Promise.all([getFollowers(channelInfo), getSubs(channelInfo)])
    const combined: any[] = viewers
      .filter((v) => followersList.has(v))
      .map((u) => {
        return {
          login: u,
          follows: true,
          isSubscriber: subsList.has(u),
        }
      })
    console.info('[giveaway][instant]', { followers: combined.length })
    viewers = combined
      .flatMap((c) => (c.isSubscriber ? Array.from({ length: subLuck }, () => c) : c))
      .map((i) => i.login)
  }
  console.info('[giveaway][instant][end]')
  return Array.from({ length: numberOfWinners }, () => {
    const winner = getRandomArrayItem(viewers)
    if (!winner) return
    return winner
  }).filter(Boolean) as string[]
}
