import { ChatItem } from '../chat'
import { ChannelInfo, Settings } from './types'
import { getRandomArrayItem, handleChatCommand } from './misc'
import { getFollowers, getSubs, getViewers } from './twitch'
import relay from './relay'
import toast from 'react-hot-toast'

const pastWinners = new Set()

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  settings: Settings
) {
  console.info('[giveaway][chat][start]')
  let subCount = 0
  let subEntries = 0
  let users = chatItems
    .filter((c) => handleChatCommand(c, chatCommand))
    .reduce<ChatItem[]>((acc, c) => (acc.some((i) => i.username === c.username) ? acc : acc.concat(c)), [])
    .flatMap((c) => {
      if (c.isSubscriber) {
        subCount += 1
        subEntries += settings.subLuck
        return Array.from({ length: settings.subLuck }, () => c)
      }
      return c
    })
  if (settings.followersOnly) {
    const followers = await getFollowers(channelInfo)
    users = users.filter((u) => followers.has(u.username))
  }

  toast.success(`${subCount} sub${subCount === 1 ? '' : 's'} in giveaway, with ${subEntries} tickets`, {
    position: 'bottom-center',
  })

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
    relay.emit('event', { winner: winner.username })
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
  let subCount = 0
  let subEntries = 0
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
      .flatMap((c) => {
        if (c.isSubscriber) {
          subCount += 1
          subEntries += settings.subLuck
          return Array.from({ length: settings.subLuck }, () => c)
        }
        return c
      })
      .map((i) => i.login)
  }
  toast.success(`${subCount} sub${subCount === 1 ? '' : 's'} in giveaway, with ${subEntries} tickets`, {
    position: 'bottom-center',
  })
  console.info('[giveaway][instant][end]')
  return Array.from({ length: settings.numberOfWinners }, () => {
    const winner = getRandomArrayItem(
      viewers.filter((u) => !pastWinners.has(u)).filter((u) => !settings.blocklist.map((b) => b.trim()).includes(u))
    )
    if (!winner) return
    pastWinners.add(winner)
    relay.emit('event', { winner })
    return winner
  }).filter(Boolean) as string[]
}
