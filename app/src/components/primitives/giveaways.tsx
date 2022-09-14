import React, { Dispatch, SetStateAction } from 'react'
import { GiPartyPopper } from 'react-icons/gi'
import { FaBullhorn, FaDice, FaExclamationTriangle, FaSpinner, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import cls from 'classnames'
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

function filterSettings(s: TSettings) {
  const { subLuck, numberOfWinners, followersOnly, sendMessages, chatCommand, winnerMessage } = s
  return {
    subLuck,
    numberOfWinners,
    followersOnly,
    sendMessages,
    chatCommand,
    winnerMessage,
  }
}

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
  const [thinking, setThinking] = React.useState(false)
  return (
    <button
      title="A giveaway that includes all viewers, regardless of if they've chatted or not"
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-all hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
      onClick={async () => {
        if (!channelInfo.login) return
        try {
          setThinking(true)
          const { winners: giveawayWinner, giveawayStats } = await getInstantGiveaway(
            client,
            channelInfo,
            settings,
            discordSettings,
            forfeits
          )
          if (!giveawayWinner.length) {
            toast.error('No winners found that match conditions!', {
              position: 'bottom-center',
              style: { fontSize: '1rem', padding: '0.2rem' },
            })
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
                  settings: filterSettings(settings),
                  giveawayStats,
                  notes: '',
                },
              ] as GiveawayResult[]
            ).concat(p)
          )
        } finally {
          setThinking(false)
        }
      }}
    >
      {thinking ? <FaSpinner className="animate-spin" /> : <FaDice className="text-2xl" />} Viewers Instant Giveaway
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
  const [thinking, setThinking] = React.useState(false)
  return (
    <button
      title="A giveaway that includes all viewers who have chatted, optionally with a chat command if set"
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-transform hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
      onClick={async () => {
        try {
          setThinking(true)
          const { winners: giveawayWinner, giveawayStats } = await getChatGiveaway(
            client,
            channelInfo,
            chatEvents,
            settings.chatCommand,
            settings,
            discordSettings,
            forfeits
          )
          if (!giveawayWinner.length) {
            toast.error('No winners found that match conditions!', {
              position: 'bottom-center',
              style: { fontSize: '1rem', padding: '0.2rem' },
            })
            return
          }
          setWinners((w) =>
            w.concat(
              giveawayWinner.map((w) => ({
                username: w.login,
                isFollower: !!w.wasFollower,
                isSubscriber: !!w.wasSubscriber,
                otherUsersWithEntry: w.otherUsersWithEntry,
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
                  settings: filterSettings(settings),
                  giveawayStats,
                  notes: '',
                },
              ] as GiveawayResult[]
            ).concat(p)
          )
        } finally {
          setThinking(false)
        }
      }}
    >
      {thinking ? <FaSpinner className="animate-spin" /> : <FaDice className="text-2xl" />} Active Chatter Giveaway
    </button>
  )
}

export type WinnerUser = Partial<{
  username: string
  id: string
  isSubscriber: boolean
  isFollower: boolean
  source: 'instant' | 'chat'
  otherUsersWithEntry?: string[]
}>
export function Winner({
  winners,
  onClear,
  ...anounceArgs
}: { winners: WinnerUser[]; onClear: (idx: number) => void } & Omit<AnnounceArgs, 'winner' | 'giveawayType'>) {
  return winners.length ? (
    <div className="grid gap-2 grid-cols-2 mt-3">
      {winners.map((winner, i) => {
        const hasWarning = (winner.otherUsersWithEntry || []).length !== 0
        return (
          <div
            key={winner.username}
            className={cls(
              'bg-gray-600 border border-gray-600 text-white rounded-md overflow-hidden flex flex-row items-center justify-center px-2 py-4 text-center relative',
              { 'border-yellow-500': hasWarning }
            )}
          >
            <div className={cls('flex flex-row items-center relative', { '-top-2': hasWarning })}>
              <GiPartyPopper className="text-purple-300 text-xl" /> <div className="px-2">{winner.username} wins!</div>{' '}
              <GiPartyPopper className="text-purple-300 text-xl" />
            </div>
            <FaBullhorn
              className={cls(
                'text-2xl absolute right-12 cursor-pointer select-none transform opacity-80 transition-opacity hover:opacity-100 hover:scale-105',
                { '-mt-4': hasWarning }
              )}
              onClick={() =>
                announceWinner({
                  ...anounceArgs,
                  giveawayType: winner.source!,
                  winner: winner.username!,
                  force: true,
                })
              }
            />
            <FaTimes
              className={cls(
                'text-2xl absolute right-5 text-red-500 cursor-pointer transform opacity-80 transition-opacity hover:opacity-100 select-none hover:scale-105',
                { '-mt-4': hasWarning }
              )}
              onClick={() => onClear(i)}
            />
            {hasWarning ? (
              <div className="text-xs text-yellow-500 pt-2 absolute bottom-1 right-0 left-0 flex flex-row gap-1 text-center justify-center items-center">
                <FaExclamationTriangle /> {winner.otherUsersWithEntry?.length} other Twitch users submitted same entry,
                shown in chat
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  ) : null
}
