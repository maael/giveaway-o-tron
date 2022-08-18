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

type UserWithSub = UserWithId & { isSubscriber: boolean }
export async function getUsersSubscriptionInfo(
  channelInfo: ChannelInfo,
  mappedUsers: Awaited<ReturnType<typeof getUsersFromNames>>,
  cache: Map<any, any> = new Map(),
  onChunk: (data: UserWithSub[]) => Promise<void> = async () => undefined
) {
  const existing = mappedUsers
    .filter((u) => cache.has(u.id))
    .map((u) => ({
      isSubscriber: cache.get(u.id),
      login: u.login,
      id: u.id,
    }))
  const toFind = mappedUsers.filter((u) => !cache.has(u.id))
  console.info('[subs]', { toFind: toFind.length, existing: existing.length })
  const chunkedUsers = chunkArray(toFind, 5)
  let embellishedUsers: UserWithSub[] = []
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
  return embellishedUsers.concat(existing)
}

type UserWithFollower = UserWithId & { follows: boolean }
export async function getFollowerInfo(
  channelInfo: ChannelInfo,
  mappedUsers: Awaited<ReturnType<typeof getUsersFromNames>>,
  chunkSize: number = 5,
  cache: Map<any, any> = new Map(),
  onChunk: (data: Awaited<ReturnType<typeof getFollowerInfo>>) => Promise<void> = async () => undefined
) {
  const existing = mappedUsers
    .filter((u) => cache.has(u.id))
    .map((u) => ({
      follows: cache.get(u.id),
      login: u.login,
      id: u.id,
    }))
  const toFind = mappedUsers.filter((u) => !cache.has(u.id))
  console.info('[follows]', { toFind: toFind.length, existing: existing.length })
  const chunkedUsers = chunkArray(toFind, chunkSize)
  let embellishedUsers: UserWithFollower[] = []
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
    await wait(200)
  }
  return embellishedUsers.concat(existing).filter((u) => u.follows)
}

type UserWithId = {
  id: string
  login: string
}
export async function getUsersFromNames(
  channelInfo: ChannelInfo,
  usernames: string[],
  cache: Map<any, any> = new Map(),
  onChunk: (data: UserWithId[]) => Promise<void> = async () => undefined
) {
  const existing = usernames
    .filter((u) => cache.has(u))
    .map((u) => ({
      id: cache.get(u),
      login: u,
    }))
  const toFind = usernames.filter((u) => !cache.has(u))
  const chunks = chunkArray(toFind, 100)
  console.info('[usernames]', { toFind: toFind.length, existing: existing.length })
  let users: UserWithId[] = []
  for (const chunk of chunks) {
    const info = await callTwitchApi(
      channelInfo,
      `users?${chunk.map((c) => `login=${encodeURIComponent(c)}`).join('&')}`
    ).then((res) => res.json())
    const mapped = info.data.map((i) => ({
      id: i.id,
      login: i.login,
    }))
    await onChunk(mapped)
    users = users.concat(mapped)
  }
  console.info('[users]', users.length)
  return users.concat(existing)
}

export async function getViewers(channelInfo: ChannelInfo) {
  return fetch(`https://discord-slash-commands.vercel.app/api/twitch-chatters?channel=${channelInfo.login}`)
    .then<ChattersApiData>((res) => res.json())
    .then((d) => d.chatters.viewers)
}
