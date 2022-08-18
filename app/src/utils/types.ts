export interface Settings {
  autoConnect: boolean
  subLuck: number
  numberOfWinners: number
  followersOnly: boolean
  chatCommand: string
}

export type ChannelInfo = Partial<{
  token: string
  login: string
  userId: string
  clientId: string
}>

export interface ChattersApiData {
  chatters_count: number
  chatters: {
    viewers: string[]
    vips: string[]
  }
}
