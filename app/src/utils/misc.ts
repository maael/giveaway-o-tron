import { ChatItem } from '~/chat'
import { AlertTheme, Settings } from './types'

export function removeIdx<T>(ar: T[], idx: number): T[] {
  return ar.slice(0, idx).concat(ar.slice(idx + 1))
}

export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function getRandomArrayItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}

const specialCommands = {
  $gw2_account$: /(^|\s)\w+\.\d{4}($|\s)/,
}

export function handleChatCommand(chatItem: ChatItem, command: string) {
  const translatedCommand: string | RegExp = specialCommands[command] || command
  if (typeof translatedCommand === 'string') {
    return translatedCommand ? chatItem.msg.toLowerCase().includes(translatedCommand.toLowerCase()) : true
  } else {
    return chatItem.msg.match(translatedCommand) !== null
  }
}

export const defaultSettings: Required<Settings> = {
  autoConnect: true,
  subLuck: 2,
  numberOfWinners: 1,
  followersOnly: true,
  chatCommand: '',
  winnerMessage: 'PartyHat @name won!',
  sendMessages: false,
  blocklist: [
    'streamelements',
    'streamlabs',
    'nightbot',
    'sery_bot',
    'soundalerts',
    'pretzelrocks',
    'fossabot',
    'moobot',
  ],
  autoScroll: true,
  spamLimit: 1,
  performanceMode: false,
  forfeitCommand: '',
  alertDuration: 4000,
  alertTheme: AlertTheme.GW2,
  autoAnnounce: true,
}

export const alertThemeMap: Record<AlertTheme, string> = {
  [AlertTheme.GW2]: 'Guild Wars 2',
}
