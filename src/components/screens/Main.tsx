import React, { Dispatch, SetStateAction } from 'react'
import cls from 'classnames'
import { GiPartyPopper } from 'react-icons/gi'
import { ChatItem } from '../../chat'
import { Settings, getInstantGiveaway, getChatGiveaway } from '../../utils'
import { FaTimes } from 'react-icons/fa'

function InstantGiveaway({
  channel,
  setWinner,
}: {
  channel: string | null
  setWinner: Dispatch<SetStateAction<string>>
}) {
  return (
    <div className="bg-gray-600 text-white rounded-md mt-3 overflow-hidden flex flex-row items-center">
      <button
        className="bg-purple-600 px-2 py-4"
        onClick={async () => {
          if (!channel) return
          const giveawayWinner = await getInstantGiveaway(channel)
          setWinner(giveawayWinner)
        }}
      >
        Viewers Instant Giveaway
      </button>
    </div>
  )
}

function ChatGiveaway({
  chatEvents,
  setWinner,
}: {
  chatEvents: ChatItem[]
  setWinner: Dispatch<SetStateAction<string>>
}) {
  return (
    <div className="bg-gray-600 text-white rounded-md mt-3 overflow-hidden flex flex-row items-center">
      <button
        className="bg-purple-600 px-2 py-4"
        onClick={async () => {
          const giveawayWinner = getChatGiveaway(chatEvents)
          setWinner(giveawayWinner)
        }}
      >
        Active Chatter Giveaway
      </button>
    </div>
  )
}

function Winner({ winner, onClear }: { winner: string; onClear: () => void }) {
  return winner ? (
    <div className="bg-gray-600 text-white rounded-md mt-3 overflow-hidden flex flex-row items-center justify-center px-2 py-4 text-center relative">
      <GiPartyPopper className="text-purple-300 text-xl" /> <div className="px-2">{winner} wins!</div>{' '}
      <GiPartyPopper className="text-purple-300 text-xl" />
      <FaTimes className="text-2xl absolute right-5 text-red-500 cursor-pointer" onClick={onClear} />
    </div>
  ) : null
}

export default function MainScreen({
  chatEvents,
  settings,
  setSettings,
  isConnected,
  channel,
}: {
  chatEvents: ChatItem[]
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  isConnected: boolean
  channel: string | null
}) {
  const [winner, setWinner] = React.useState('')
  return (
    <>
      <Winner winner={winner} onClear={() => setWinner('')} />
      <InstantGiveaway channel={channel} setWinner={setWinner} />
      <ChatGiveaway chatEvents={chatEvents} setWinner={setWinner} />
      <div className="mt-2 rounded-md bg-gray-700 flex-1 flex flex-col relative overflow-hidden">
        <div className="bg-gray-600 absolute top-0 right-0 left-0 h-8 flex justify-between px-10 items-center text-white">
          <div>
            {chatEvents.length} message{chatEvents.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="relative flex-1">
          {chatEvents.length === 0 ? (
            <span className={cls('relative left-2 top-9')}>Logs will appear here...</span>
          ) : (
            <div
              className={cls(
                'absolute right-0 left-0 bottom-0 overflow-y-scroll px-2 pt-1 pb-3 flex flex-col gap-1 top-8'
              )}
            >
              {chatEvents
                .filter((c) => (winner ? c.username === winner : true))
                .map((c) => {
                  return (
                    <div key={c.id}>
                      <span className="rounded-full bg-purple-700 h-4 w-4 inline-block mr-1">
                        <span className="flex justify-center items-center text-xs" title={`Team: ${'Default'}`}>
                          D
                        </span>
                      </span>
                      <span style={{ color: c.color }}>[{c.displayName}]</span> {highlightAction(c.displayName, c.msg)}
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function highlightAction(displayName: string, msg: string): React.ReactNode[] {
  // const commands = controls.map(({ command }) => command.toLowerCase())
  const words = msg.split(' ')
  const matchIdx = -1
  // const matchIdx = words.findIndex((w, i) => {
  //   return commands.some((c) => c === w.toLowerCase())
  // }, [])
  return matchIdx > -1
    ? [
        words.slice(0, matchIdx).join(' '),
        <span
          key="highlight"
          className="bg-purple-500 text-white rounded-sm font-bold text-center"
          style={{ padding: '1px 2px', margin: '0px 4px' }}
        >
          {' '}
          {words[matchIdx]}{' '}
        </span>,
        words.slice(matchIdx + 1).join(' '),
      ]
    : [msg]
}
