import { ChannelInfo, ChattersApiData } from './types'
import { wait, chunkArray } from './misc'

async function callTwitchApi(channelInfo: ChannelInfo, path: string) {
  return fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: {
      Authorization: `Bearer ${channelInfo.token}`,
      'Client-ID': `${channelInfo.clientId}`,
    },
  })
}

export async function getUsersSubscriptionInfo(
  channelInfo: ChannelInfo,
  mappedUsers: Awaited<ReturnType<typeof getUsersFromNames>>,
  onChunk: (data: Awaited<ReturnType<typeof getUsersSubscriptionInfo>>) => Promise<void> = async () => undefined
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
          const info = await callTwitchApi(
            channelInfo,
            `subscriptions/user?broadcaster_id=${channelInfo.userId}&user_id=${user.id}`
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
    await onChunk(embellishedChunk)
    embellishedUsers = embellishedUsers.concat(embellishedChunk)
    await wait(200)
  }
  return embellishedUsers
}

export async function getFollowerInfo(
  channelInfo: ChannelInfo,
  mappedUsers: Awaited<ReturnType<typeof getUsersFromNames>>,
  chunkSize: number = 5,
  onChunk: (data: Awaited<ReturnType<typeof getFollowerInfo>>) => Promise<void> = async () => undefined
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
        const info = await callTwitchApi(
          channelInfo,
          `users/follows?from_id=${userId}&to_id=${channelInfo.userId}`
        ).then((res) => res.json())
        return {
          ...user,
          follows: info.data.total === 1,
        }
      })
    )
    await onChunk(embellishedChunk)
    embellishedUsers = embellishedUsers.concat(embellishedChunk)
    await wait(100)
  }
  return embellishedUsers.filter((u) => u.follows)
}

export async function getUsersFromNames(
  channelInfo: ChannelInfo,
  usernames: string[],
  onChunk: (data: Awaited<ReturnType<typeof getUsersFromNames>>) => Promise<void> = async () => undefined
) {
  const toFind = usernames.slice(0, 1000)
  const chunks = chunkArray(toFind, 100)
  console.info('[usernames]', toFind.length)
  let users: { id: string; login: string; displayName: string }[] = []
  for (const chunk of chunks) {
    const info = await callTwitchApi(
      channelInfo,
      `users?${chunk.map((c) => `login=${encodeURIComponent(c)}`).join('&')}`
    ).then((res) => res.json())
    const mapped = info.data.map((i) => ({
      id: i.id,
      login: i.login,
      displayName: i.display_name,
    }))
    await onChunk(mapped)
    users = users.concat(mapped)
  }
  console.info('[users]', users.length)
  return users
}

export async function getViewers(channelInfo: ChannelInfo) {
  return fetch(`https://discord-slash-commands.vercel.app/api/twitch-chatters?channel=${channelInfo.login}`)
    .then<ChattersApiData>((res) => res.json())
    .then((d) => d.chatters.viewers)
}
