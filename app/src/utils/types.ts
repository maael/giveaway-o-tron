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
  alertTheme?: AlertTheme.GW2
  autoAnnounce?: boolean
}

export enum AlertTheme {
  GW2 = 'gw2',
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
  winners: {
    login: string
    wasSubscriber: boolean | null
    wasFollower: boolean | null
    notes?: string
  }[]
  createdAt: string
  type: GiveawayType
  notes: string
}
