import React, { Dispatch, SetStateAction, useEffect } from 'react'
import cls from 'classnames'
import { GiPartyPopper } from 'react-icons/gi'
import { ChatItem } from '../../chat'
import { Settings, getInstantGiveaway, getChatGiveaway, getTwitchUsersByLogin, removeIdx } from '../../utils'
import { FaDice, FaTimes } from 'react-icons/fa'

function InstantGiveaway({
  channel,
  setWinners,
  channelUserId,
}: {
  channel: string | null
  setWinners: Dispatch<SetStateAction<string[]>>
  channelUserId: string | null
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1"
      onClick={async () => {
        if (!channel) return
        const giveawayWinner = await getInstantGiveaway(channel, channelUserId)
        if (!giveawayWinner) return
        setWinners((w) => w.concat(giveawayWinner))
      }}
    >
      <FaDice className="text-2xl" /> Viewers Instant Giveaway
    </button>
  )
}

function ChatGiveaway({
  chatEvents,
  setWinners,
  channelUserId,
  chatCommand,
}: {
  chatEvents: ChatItem[]
  setWinners: Dispatch<SetStateAction<string[]>>
  channelUserId: string | null
  chatCommand: string
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1"
      onClick={async () => {
        const giveawayWinner = getChatGiveaway(chatEvents, chatCommand)
        if (!giveawayWinner) return
        setWinners((w) => w.concat(giveawayWinner))
      }}
    >
      <FaDice className="text-2xl" /> Active Chatter Giveaway
    </button>
  )
}

function Winner({ winners, onClear }: { winners: string[]; onClear: (idx: number) => void }) {
  return winners.length ? (
    <div className="grid gap-1 grid-cols-2 mt-3">
      {winners.map((winner, i) => (
        <div
          key={winner}
          className="bg-gray-600 text-white rounded-md overflow-hidden flex flex-row items-center justify-center px-2 py-4 text-center relative"
        >
          <div className="text-2xl absolute left-5">{i + 1}.</div>
          <GiPartyPopper className="text-purple-300 text-xl" /> <div className="px-2">{winner} wins!</div>{' '}
          <GiPartyPopper className="text-purple-300 text-xl" />
          <FaTimes className="text-2xl absolute right-5 text-red-500 cursor-pointer" onClick={() => onClear(i)} />
        </div>
      ))}
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
  const [winners, setWinners] = React.useState<string[]>([])
  const [channelUserId, setChannelUserId] = React.useState(null)
  React.useEffect(() => {
    if (!channel) return
    ;(async () => {
      const channelUser = (await getTwitchUsersByLogin([channel]))[0]
      console.info({ channelUser })
      setChannelUserId(channelUser.id)
    })()
  }, [channel])
  const [chatCommand, setChatCommand] = React.useState('')
  return (
    <>
      <Winner winners={winners} onClear={(idx) => setWinners((w) => removeIdx(w, idx))} />
      <div className="flex flex-row gap-2">
        <InstantGiveaway channelUserId={channelUserId} channel={channel} setWinners={setWinners} />
        <ChatGiveaway
          channelUserId={channelUserId}
          chatEvents={chatEvents}
          setWinners={setWinners}
          chatCommand={chatCommand}
        />
      </div>
      <div className="mt-2 flex justify-center items-center">
        <div>
          <input
            className="bg-gray-700 px-2 py-1 rounded-md border-b border-purple-500"
            placeholder="Chat command..."
            value={chatCommand}
            onChange={(e) => setChatCommand(e.target.value.trim())}
            title="Chat command to enter - leave empty for none"
          />
        </div>
      </div>
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
                .filter((c) => (winners.length ? winners.includes(c.username) : true))
                .map((c) => {
                  return (
                    <div key={c.id}>
                      <span
                        className={cls('rounded-full bg-gray-300 h-4 w-4 inline-block mr-1', {
                          'bg-yellow-500': c.isSubscriber,
                        })}
                      >
                        {c.isSubscriber ? (
                          <span className="flex justify-center items-center text-xs" title={'Subscriber'}>
                            S
                          </span>
                        ) : null}
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
