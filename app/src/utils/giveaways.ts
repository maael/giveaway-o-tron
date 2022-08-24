import { ChatItem } from '../chat'
import { ChannelInfo, GiveawayResult, Settings } from './types'
import { getRandomArrayItem, handleChatCommand } from './misc'
import { getFollowers, getSubs, getViewers } from './twitch'
import relay from './relay'
import toast from 'react-hot-toast'

const pastWinners = new Set()

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  settings: Settings,
  forfeits: string[]
): Promise<GiveawayResult['winners']> {
  const forfeitSet = new Set([...forfeits])
  console.info('[giveaway][chat][start]')
  let subCount = 0
  let subEntries = 0
  let followers: null | Map<any, any>
  const chatCommandEvents = chatItems.filter((c) => handleChatCommand(c, chatCommand))
  const spamCounts = chatCommandEvents.reduce((acc, u) => {
    acc.set(u.username, (acc.get(u.username) || 0) + 1)
    return acc
  }, new Map<string, number>())
  let users = chatCommandEvents
    .reduce<ChatItem[]>((acc, c) => (acc.some((i) => i.username === c.username) ? acc : acc.concat(c)), [])
    .filter((i) => {
      if (!settings.chatCommand) return true
      if (!settings.spamLimit || settings.spamLimit === 1) return true
      const count = spamCounts.get(i.username)
      if (count === undefined) return
      const didSpam = count > settings.spamLimit
      return !didSpam
    })
    .flatMap((c) => {
      if (c.isSubscriber) {
        subCount += 1
        subEntries += settings.subLuck
        return Array.from({ length: settings.subLuck }, () => c)
      }
      return c
    })
  if (settings.followersOnly) {
    followers = await getFollowers(channelInfo)
    users = users.filter((u) => followers!.has(u.username))
  }

  toast.success(`${subCount} sub${subCount === 1 ? '' : 's'} in giveaway, with ${subEntries} tickets`, {
    position: 'bottom-center',
  })

  console.info('[giveaway][chat][end]')
  return Array.from({ length: settings.numberOfWinners }, () => {
    const winner = getRandomArrayItem(
      users
        .filter((u) => !pastWinners.has(u.username) && !forfeitSet.has(u.username))
        .filter(
          (u) =>
            !settings.blocklist.map((b) => b.trim()).includes(u.displayName) &&
            !settings.blocklist.map((b) => b.trim()).includes(u.username)
        )
    )
    if (!winner) return
    pastWinners.add(winner.username)
    relay.emit('event', {
      type: 'winner',
      winner: winner.username,
      channelId: channelInfo.userId,
      login: channelInfo.login,
      alertDuration: settings.alertDuration,
      alertTheme: settings.alertTheme,
    })
    return {
      login: winner.username,
      wasSubscriber: winner.isSubscriber,
      wasFollower: followers?.has(winner.username),
    }
  }).filter(Boolean) as GiveawayResult['winners']
}

export async function getInstantGiveaway(
  channelInfo: ChannelInfo,
  settings: Settings,
  forfeits: string[]
): Promise<GiveawayResult['winners']> {
  const forfeitSet = new Set([...forfeits])
  console.info('[giveaway][instant][start]')
  let viewers = await getViewers(channelInfo)
  let subCount = 0
  let subEntries = 0
  let subsList: null | Map<any, any>, followersList: null | Map<any, any>
  console.info({ viewers: viewers.length })
  if (settings.followersOnly) {
    const [followersListMap, subsListMap] = await Promise.all([getFollowers(channelInfo), getSubs(channelInfo)])
    followersList = followersListMap
    subsList = subsListMap
    const combined: any[] = viewers
      .filter((v) => followersList!.has(v))
      .map((u) => {
        return {
          login: u,
          follows: true,
          isSubscriber: subsList!.has(u),
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
  return (
    Array.from({ length: settings.numberOfWinners }, () => {
      const winner = getRandomArrayItem(
        viewers
          .filter((u) => !pastWinners.has(u) && !forfeitSet.has(u))
          .filter((u) => !settings.blocklist.map((b) => b.trim()).includes(u))
      )
      if (!winner) return
      pastWinners.add(winner)
      relay.emit('event', {
        type: 'winner',
        winner,
        channelId: channelInfo.userId,
        login: channelInfo.login,
        alertDuration: settings.alertDuration,
        alertTheme: settings.alertTheme,
      })
      return winner
    }).filter(Boolean) as string[]
  ).map((u) => ({ login: u, wasSubscriber: subsList?.has(u) ?? null, wasFollower: followersList?.has(u) ?? null }))
}
