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

async function getUsersSubscriptionInfo(
  channelInfo: ChannelInfo,
  mappedUsers: Awaited<ReturnType<typeof getUsersFromNames>>
) {
  const chunkedUsers = chunkArray(mappedUsers, 5)
  let embellishedUsers: {
    id: string
    login: string
    displayName: string
    isSubscriber: boolean
  }[] = []
  for (const chunk of chunkedUsers) {
    const embellishedChunk = await Promise.all(
      chunk.map(async (user) => {
        try {
          const info = await fetch(
            `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${channelInfo.userId}&user_id=${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${channelInfo.token}`,
                'Client-ID': `${channelInfo.clientId}`,
              },
            }
          )
          const isSubscriber = info.status === 200
          return {
            ...user,
            isSubscriber,
          }
        } catch {
          return {
            ...user,
            isSubscriber: false,
          }
        }
      })
    )
    embellishedUsers = embellishedUsers.concat(embellishedChunk)
    await wait(200)
  }
  return embellishedUsers
}

export async function getInstantGiveaway(channelInfo: ChannelInfo, subLuck = 2, followerOnly: boolean = true) {
  let viewers = await fetch(
    `https://discord-slash-commands.vercel.app/api/twitch-chatters?channel=${channelInfo.login}`
  )
    .then<ChattersApiData>((res) => res.json())
    .then((d) => d.chatters.viewers)
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
  const winner = getRandomArrayItem(viewers)
  return winner
}

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function getFollowerInfo(
  channelInfo: ChannelInfo,
  mappedUsers: Awaited<ReturnType<typeof getUsersFromNames>>,
  chunkSize: number = 5
) {
  const chunkedUsers = chunkArray(mappedUsers, chunkSize)
  let embellishedUsers: {
    id: string
    login: string
    displayName: string
    follows: boolean
  }[] = []
  for (const chunk of chunkedUsers) {
    const embellishedChunk = await Promise.all(
      chunk.map(async (user) => {
        const userId = user.id
        const info = await fetch(
          `https://api.twitch.tv/helix/users/follows?from_id=${userId}&to_id=${channelInfo.userId}`,
          {
            headers: {
              Authorization: `Bearer ${channelInfo.token}`,
              'Client-ID': `${channelInfo.clientId}`,
            },
          }
        ).then((res) => res.json())
        return {
          ...user,
          follows: info.data.total === 1,
        }
      })
    )
    embellishedUsers = embellishedUsers.concat(embellishedChunk)
    await wait(100)
  }
  return embellishedUsers.filter((u) => u.follows)
}

function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}

async function getUsersFromNames(channelInfo: ChannelInfo, usernames: string[]) {
  const toFind = usernames.slice(0, 1000)
  const chunks = chunkArray(toFind, 100)
  console.info('[usernames]', toFind.length)
  let users: { id: string; login: string; displayName: string }[] = []
  for (const chunk of chunks) {
    const info = await fetch(
      `https://api.twitch.tv/helix/users?${chunk.map((c) => `login=${encodeURIComponent(c)}`).join('&')}`,
      {
        headers: {
          Authorization: `Bearer ${channelInfo.token}`,
          'Client-ID': `${channelInfo.clientId}`,
        },
      }
    ).then((res) => res.json())
    const mapped = info.data.map((i) => ({
      id: i.id,
      login: i.login,
      displayName: i.display_name,
    }))
    users = users.concat(mapped)
  }
  console.info('[users]', users.length)
  return users
}

export async function getChatGiveaway(
  channelInfo: ChannelInfo,
  chatItems: ChatItem[],
  chatCommand: string,
  subLuck: number = 2,
  followerOnly: boolean = true
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
  const winner = getRandomArrayItem(users)
  return {
    username: winner.username,
    isSubscriber: winner.isSubscriber,
    id: winner.id,
  }
}

export function removeIdx<T>(ar: T[], idx: number): T[] {
  return ar.slice(0, idx).concat(ar.slice(idx + 1))
}
