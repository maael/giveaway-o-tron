import React, { Dispatch, SetStateAction } from 'react'
import { GiPartyPopper } from 'react-icons/gi'
import { FaBullhorn, FaDice, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ChatItem } from '../../chat'
import {
  Settings as TSettings,
  getInstantGiveaway,
  getChatGiveaway,
  ChannelInfo,
  GiveawayResult,
  GiveawayType,
  AnnounceArgs,
  announceWinner,
  DiscordSettings,
} from '../../utils'
import chat from '../../chat'

export function InstantGiveaway({
  setWinners,
  channelInfo,
  discordSettings,
  settings,
  client,
  setPastGiveaways,
  forfeits,
}: {
  setWinners: Dispatch<SetStateAction<WinnerUser[]>>
  channelInfo: ChannelInfo
  discordSettings: DiscordSettings
  settings: TSettings
  client: ReturnType<typeof chat> | null
  setPastGiveaways: Dispatch<SetStateAction<GiveawayResult[]>>
  forfeits: string[]
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-all hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
      onClick={async () => {
        if (!channelInfo.login) return
        const giveawayWinner = await getInstantGiveaway(client, channelInfo, settings, discordSettings, forfeits)
        if (!giveawayWinner.length) {
          toast.error('No winners found that match conditions!', { position: 'bottom-center' })
          return
        }
        setWinners((w) => w.concat(giveawayWinner.map((u) => ({ username: u.login }))))
        setPastGiveaways((p) =>
          (
            [
              {
                type: GiveawayType.Instant,
                createdAt: new Date().toISOString(),
                winners: giveawayWinner,
                settings: settings,
                notes: '',
              },
            ] as GiveawayResult[]
          ).concat(p)
        )
      }}
    >
      <FaDice className="text-2xl" /> Viewers Instant Giveaway
    </button>
  )
}

export function ChatGiveaway({
  chatEvents,
  setWinners,
  channelInfo,
  discordSettings,
  settings,
  client,
  setPastGiveaways,
  forfeits,
}: {
  chatEvents: ChatItem[]
  setWinners: Dispatch<SetStateAction<WinnerUser[]>>
  channelInfo: ChannelInfo
  discordSettings: DiscordSettings
  settings: TSettings
  client: ReturnType<typeof chat> | null
  setPastGiveaways: Dispatch<SetStateAction<GiveawayResult[]>>
  forfeits: string[]
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-transform hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
      onClick={async () => {
        const giveawayWinner = await getChatGiveaway(
          client,
          channelInfo,
          chatEvents,
          settings.chatCommand,
          settings,
          discordSettings,
          forfeits
        )
        if (!giveawayWinner.length) {
          toast.error('No winners found that match conditions!', { position: 'bottom-center' })
          return
        }
        setWinners((w) =>
          w.concat(
            giveawayWinner.map((w) => ({
              username: w.login,
              isFollower: !!w.wasFollower,
              isSubscriber: !!w.wasSubscriber,
            }))
          )
        )
        setPastGiveaways((p) =>
          (
            [
              {
                type: GiveawayType.Chat,
                createdAt: new Date().toISOString(),
                winners: giveawayWinner,
                settings: settings,
                notes: '',
              },
            ] as GiveawayResult[]
          ).concat(p)
        )
      }}
    >
      <FaDice className="text-2xl" /> Active Chatter Giveaway
    </button>
  )
}

export type WinnerUser = Partial<{
  username: string
  id: string
  isSubscriber: boolean
  isFollower: boolean
}>
export function Winner({
  winners,
  onClear,
  ...anounceArgs
}: { winners: WinnerUser[]; onClear: (idx: number) => void } & Omit<AnnounceArgs, 'winner'>) {
  return winners.length ? (
    <div className="grid gap-1 grid-cols-2 mt-3">
      {winners.map((winner, i) => (
        <div
          key={winner.username}
          className="bg-gray-600 text-white rounded-md overflow-hidden flex flex-row items-center justify-center px-2 py-4 text-center relative"
        >
          <div className="text-2xl absolute left-5">{i + 1}.</div>
          <GiPartyPopper className="text-purple-300 text-xl" /> <div className="px-2">{winner.username} wins!</div>{' '}
          <GiPartyPopper className="text-purple-300 text-xl" />
          <FaBullhorn
            className="text-2xl absolute right-12 cursor-pointer select-none transform opacity-80 transition-opacity hover:opacity-100 hover:scale-105"
            onClick={() => announceWinner({ ...anounceArgs, winner: winner.username!, force: true })}
          />
          <FaTimes
            className="text-2xl absolute right-5 text-red-500 cursor-pointer transform opacity-80 transition-opacity hover:opacity-100 select-none hover:scale-105"
            onClick={() => onClear(i)}
          />
        </div>
      ))}
    </div>
  ) : null
}
