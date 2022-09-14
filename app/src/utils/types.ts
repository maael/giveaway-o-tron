export interface Settings {
  autoConnect: boolean
  subLuck: number
  numberOfWinners: number
  followersOnly: boolean
  chatCommand: string
  winnerMessage: string
  sendMessages: boolean
  blocklist: string[]
  autoScroll?: boolean
  spamLimit?: number
  performanceMode?: boolean
  forfeitCommand?: string
  alertDuration?: number
  alertTheme?: AlertTheme
  alertCustomImageUrl?: string
  autoAnnounce?: boolean
  timerBell?: boolean
  giveawayName?: string
  timerDuration?: number
  timerAlertHidden?: boolean
}

export interface DiscordSettings {
  guildId?: string
  channelId?: string
  messageColour?: string
  startTitle?: string
  startBody?: string
  startEnabled?: boolean
  endTitle?: string
  endBody?: string
  endEnabled?: boolean
  winnerTitle?: string
  winnerBody?: string
  winnerEnabled?: boolean
  giveawayMinTime?: number
}

export enum AlertTheme {
  GW2 = 'gw2',
  Custom = 'custom',
}

export type ChannelInfo = Partial<{
  token: string
  refreshToken: string
  login: string
  userId: string
  clientId: string
}>

export interface ChattersApiData {
  chatters_count: number
  chatters: {
    viewers: string[]
    vips: string[]
    moderators: string[]
    staff: string[]
    admins: string[]
    global_mods: string[]
  }
}

export enum GiveawayType {
  Instant = 'Instant',
  Chat = 'Chat',
}

export interface GiveawayResult {
  settings: Omit<Settings, 'autoScroll' | 'autoConnect'>
  giveawayStats?: {
    users: number
    followers: number
    subs: number
    finalEntries: number
    entries: number
  }
  winners: {
    login: string
    wasSubscriber: boolean | null
    wasFollower: boolean | null
    notes?: string
    otherUsersWithEntry?: string[]
  }[]
  createdAt: string
  type: GiveawayType
  notes: string
}
