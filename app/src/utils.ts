// import { ChatItem } from './chat'
// import { ControlConfig } from './components/screens/ControlsConfig'

import { ChatItem } from './chat'

const TOKEN = ''
const CLIENT_ID = ''

export interface Settings {
  autoConnect: boolean
}

export type ChannelInfo = Partial<{
  token: string
  login: string
  userId: string
  clientId: string
}>

export function getRandomArrayItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

interface ChattersApiData {
  chatters_count: number
  chatters: {
    viewers: string[]
    vips: string[]
  }
}

export async function getInstantGiveaway(channel: string, channelUserId: string | null) {
  const [viewers] = await Promise.all([
    fetch(`https://discord-slash-commands.vercel.app/api/twitch-chatters?channel=${channel}`)
      .then<ChattersApiData>((res) => res.json())
      .then((d) => d.chatters.viewers),
  ])
  const winner = getRandomArrayItem(viewers)
  return winner
}

export function getChatGiveaway(chatItems: ChatItem[], chatCommand: string) {
  const users = [
    ...new Set(
      chatItems
        .filter((c) => (chatCommand ? c.msg.toLowerCase().includes(chatCommand.toLowerCase()) : true))
        .map((c) => c.username)
    ),
  ]
  return getRandomArrayItem(users)
}

export async function getTwitchUsersByLogin(logins: string[]) {
  const info = await fetch(
    `https://api.twitch.tv/helix/users?${logins.map((l) => `login=${encodeURIComponent(l)}`).join('&')}`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Client-ID': CLIENT_ID,
      },
    }
  ).then((res) => res.json())
  return info.data.map((i) => ({ id: i.id, username: i.login, displayName: i.display_name }))
}

export async function getUserFollowers(toId: number) {
  const followers = []
  let after = ''
  do {
    const page = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${toId}&first=100&after=${after}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Client-ID': CLIENT_ID,
      },
    }).then((res) => res.json())
    followers.concat(
      page.data.map((i) => ({ id: i.from_id, login: i.from_login, name: i.from_name, since: i.followed_at }))
    )
    after = page.pagination.cursor
  } while (after)
  return followers
}

export async function isUserFollower(user: string, userId: string | null) {
  const info = await fetch(`https://api.twitch.tv/helix/users/follows?from_id=${userId}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Client-ID': CLIENT_ID,
    },
  })
}

export function removeIdx<T>(ar: T[], idx: number): T[] {
  return ar.slice(0, idx).concat(ar.slice(idx + 1))
}
