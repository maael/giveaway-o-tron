import { ChatItem } from '../chat'
import { ChannelInfo, Settings } from './types'
import { getRandomArrayItem } from './misc'
import { getFollowers, getSubs, getViewers } from './twitch'

const pastWinners = new Set()

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  settings: Settings
) {
  console.info('[giveaway][chat][start]')
  let users = chatItems
    .filter((c) => (chatCommand ? c.msg.toLowerCase().includes(chatCommand.toLowerCase()) : true))
    .reduce<ChatItem[]>((acc, c) => (acc.some((i) => i.username === c.username) ? acc : acc.concat(c)), [])
    .flatMap((c) => (c.isSubscriber ? Array.from({ length: settings.subLuck }, () => c) : c))
  if (settings.followersOnly) {
    const followers = await getFollowers(channelInfo)
    users = users.filter((u) => followers.has(u.username))
  }

  console.info('[giveaway][chat][end]')
  return Array.from({ length: settings.numberOfWinners }, () => {
    const winner = getRandomArrayItem(
      users
        .filter((u) => !pastWinners.has(u.username))
        .filter(
          (u) =>
            !settings.blocklist.map((b) => b.trim()).includes(u.displayName) &&
            !settings.blocklist.map((b) => b.trim()).includes(u.username)
        )
    )
    if (!winner) return
    pastWinners.add(winner.username)
    return {
      username: winner.username,
      isSubscriber: winner.isSubscriber,
      id: winner.id,
    }
  }).filter(Boolean) as { username: string; isSubscriber: boolean; id: string }[]
}

export async function getInstantGiveaway(channelInfo: ChannelInfo, settings: Settings) {
  console.info('[giveaway][instant][start]')
  let viewers = await getViewers(channelInfo)
  console.info({ viewers: viewers.length })
  if (settings.followersOnly) {
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
      .flatMap((c) => (c.isSubscriber ? Array.from({ length: settings.subLuck }, () => c) : c))
      .map((i) => i.login)
  }
  console.info('[giveaway][instant][end]')
  return Array.from({ length: settings.numberOfWinners }, () => {
    const winner = getRandomArrayItem(
      viewers.filter((u) => !pastWinners.has(u)).filter((u) => !settings.blocklist.map((b) => b.trim()).includes(u))
    )
    if (!winner) return
    pastWinners.add(winner)
    return winner
  }).filter(Boolean) as string[]
}
