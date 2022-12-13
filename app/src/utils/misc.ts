import { ChatItem } from '~/chat'
import { AlertTheme, Settings, DiscordSettings } from './types'

export const ONE_MIN = 1000 * 60

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
  $steam_friend$: /(^|\s)\d{8}($|\s)/,
  $gw2_or_steam$: /(^|\s)\w+\.\d{4}($|\s)|(^|\s)\d{8}($|\s)/,
  $gw2_or_steam_or_paypal$: /(^|\s)\w+\.\d{4}($|\s)|(^|\s)\d{8}|paypal($|\s)/i,
}

const specialCommandsForCombination = {
  $gw2_account$: '\\w+\\.\\d{4}',
  $steam_friend$: '\\d{8}',
  $gw2_or_steam$: '\\w+\\.\\d{4}|\\d{8}',
  $gw2_or_steam_or_paypal$: '\\w+\\.\\d{4}|\\d{8}|paypal',
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export function handleChatCommand(
  chatItem: ChatItem,
  command: string
): { isMatch: boolean; isSpecial: boolean; match: string } {
  const cleanCommand = command.trim()
  let translatedCommand: string | RegExp = specialCommands[cleanCommand] || cleanCommand
  const matchingCommand = Object.keys(specialCommandsForCombination).some(
    (k) => cleanCommand.includes(k) && cleanCommand !== k
  )
  if (matchingCommand) {
    const tranformedCommand = new RegExp(
      cleanCommand
        .split(' ')
        .map((c) => specialCommandsForCombination[c] || escapeRegExp(c))
        .join(' '),
      'i'
    )
    translatedCommand = tranformedCommand
  }
  if (typeof translatedCommand === 'string') {
    return {
      isMatch: translatedCommand ? chatItem.msg.toLowerCase().includes(translatedCommand.toLowerCase()) : true,
      isSpecial: false,
      match: translatedCommand || '',
    }
  } else {
    const match = chatItem.msg.match(translatedCommand)
    return { isMatch: match !== null, isSpecial: true, match: match ? match[0]?.trim() : '' }
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
  giveawayName: '',
  timerBell: false,
  timerDuration: ONE_MIN,
  alertCustomImageUrl: '',
  timerAlertHidden: false,
}

export const defaultDiscordSettings: Required<DiscordSettings> = {
  guildId: '',
  channelId: '',
  messageColour: '',
  startTitle: '',
  startBody: '',
  startEnabled: true,
  endTitle: '',
  endBody: '',
  endEnabled: true,
  winnerTitle: '',
  winnerBody: '',
  winnerEnabled: true,
  giveawayMinTime: ONE_MIN,
}

export const alertThemeMap: Record<AlertTheme, string> = {
  [AlertTheme.GW2]: 'Guild Wars 2',
  [AlertTheme.Custom]: 'Custom',
}

export const alertOptions = Object.entries(alertThemeMap)
  .map(([k, v]) => {
    return { value: k, label: v }
  })
  .filter((i) => Boolean(i.label)) as { value: AlertTheme; label: string }[]

export function getDiscordColour(discordColour?: string) {
  const colour = Number(`0x${discordColour?.replace('#', '')}`)
  return isNaN(colour) ? undefined : colour
}
