// import { ChatItem } from './chat'
// import { ControlConfig } from './components/screens/ControlsConfig'

import { ChatItem } from './chat'

export interface Settings {
  autoConnect: boolean
}

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

export async function getInstantGiveaway(channel: string) {
  const data = await fetch(
    `https://discord-slash-commands.vercel.app/api/twitch-chatters?channel=${channel}`
  ).then<ChattersApiData>((res) => res.json())
  const { viewers } = data.chatters
  const winner = getRandomArrayItem(viewers)
  return winner
}

export function getChatGiveaway(chatItems: ChatItem[]) {
  const users = [...new Set(chatItems.map((c) => c.username))]
  return getRandomArrayItem(users)
}
