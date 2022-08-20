import React, { Dispatch, SetStateAction } from 'react'
import { GiPartyPopper } from 'react-icons/gi'
import { FaDice, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ChatItem } from '../../chat'
import { Settings as TSettings, getInstantGiveaway, getChatGiveaway, ChannelInfo } from '../../utils'
import chat from '../../chat'

export function InstantGiveaway({
  setWinners,
  channelInfo,
  settings,
  client,
}: {
  setWinners: Dispatch<SetStateAction<WinnerUser[]>>
  channelInfo: ChannelInfo
  settings: TSettings
  client: ReturnType<typeof chat> | null
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-all hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
      onClick={async () => {
        if (!channelInfo.login) return
        const giveawayWinner = await getInstantGiveaway(channelInfo, settings)
        if (!giveawayWinner.length) {
          toast.error('No winners found that match conditions!', { position: 'bottom-center' })
          return
        }
        giveawayWinner.forEach((w) => {
          if (settings.sendMessages) {
            client?.say(channelInfo.login!, settings.winnerMessage.replace('@name', `@${w}`))
          }
        })
        setWinners((w) => w.concat(giveawayWinner.map((u) => ({ username: u }))))
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
  settings,
  client,
}: {
  chatEvents: ChatItem[]
  setWinners: Dispatch<SetStateAction<WinnerUser[]>>
  channelInfo: ChannelInfo
  settings: TSettings
  client: ReturnType<typeof chat> | null
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-transform hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
      onClick={async () => {
        const giveawayWinner = await getChatGiveaway(channelInfo, chatEvents, settings.chatCommand, settings)
        if (!giveawayWinner.length) {
          toast.error('No winners found that match conditions!', { position: 'bottom-center' })
          return
        }
        if (settings.sendMessages) {
          giveawayWinner.forEach((w) => {
            client?.say(channelInfo.login!, settings.winnerMessage.replace('@name', `@${w.username}`))
          })
        }
        setWinners((w) => w.concat(giveawayWinner))
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
export function Winner({ winners, onClear }: { winners: WinnerUser[]; onClear: (idx: number) => void }) {
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
          <FaTimes
            className="text-2xl absolute right-5 text-red-500 cursor-pointer select-none"
            onClick={() => onClear(i)}
          />
        </div>
      ))}
    </div>
  ) : null
}
