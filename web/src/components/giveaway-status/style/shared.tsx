export const SPECIAL_COMMAND_TEXT = {
  $gw2_account$: 'your Guild Wars 2 account name XXXX.1234',
  $steam_friend$: 'your 8 digit Steam friend code',
  $gw2_or_steam$: 'either your GW2 account name or Steam friend code',
  $gw2_or_steam_or_paypal$: 'either your GW2 account name or Steam friend code or the word paypal',
}

export interface StatusProps {
  title?: string | null
  body?: string | null
  status?: string
  command?: string
  followersOnly?: boolean
  imageUrl?: string
  goalTs?: number
}
