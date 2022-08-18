import React, { Dispatch, SetStateAction } from 'react'
import cls from 'classnames'
import { ChatItem } from '../../chat'
import { WinnerUser } from '../primitives/giveaways'
import { FaPauseCircle, FaPlayCircle, FaTimesCircle } from 'react-icons/fa'

export default function ChatBox({
  chatEvents,
  winners,
  paused,
  setPaused,
  clear,
}: {
  chatEvents: ChatItem[]
  winners: WinnerUser[]
  paused: boolean
  setPaused: Dispatch<SetStateAction<boolean>>
  clear: () => void
}) {
  const limitedMessages = chatEvents.filter((c) =>
    winners.length ? winners.map((c) => c.username).includes(c.username) : true
  )
  return (
    <>
      <div className="mt-2 rounded-md bg-gray-700 flex-1 flex flex-col relative overflow-hidden">
        <div className="bg-gray-600 absolute top-0 right-0 left-0 h-8 flex justify-between px-5 items-center text-white z-50">
          <div>
            {chatEvents.length} message{chatEvents.length === 1 ? '' : 's'}
          </div>
          {winners.length ? (
            <div>
              {limitedMessages.length} winner message{limitedMessages.length === 1 ? '' : 's'}
            </div>
          ) : null}
          <div className="flex flex-row justify-center items-center gap-2 text-xl">
            {paused ? (
              <FaPlayCircle
                className="select-none cursor-pointer transition-opacity hover:opacity-70"
                onClick={() => setPaused((p) => !p)}
                title="Resume chat"
              />
            ) : (
              <FaPauseCircle
                className="select-none cursor-pointer  transition-opacity hover:opacity-70"
                onClick={() => setPaused((p) => !p)}
                title="Pause chat, misses messages while paused"
              />
            )}
            <FaTimesCircle
              className="text-red-500 select-none cursor-pointer  transition-opacity hover:opacity-70"
              onClick={() => clear()}
              title="Clear chat"
            />
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
              {limitedMessages.map((c) => {
                return (
                  <div key={c.id}>
                    <span
                      className={cls('rounded-full bg-gray-300 h-4 w-4 inline-block mr-1', {
                        'bg-yellow-500': c.isSubscriber,
                      })}
                    >
                      {c.isSubscriber ? (
                        <span
                          className="flex justify-center items-center text-xs cursor-default select-none"
                          title={'Subscriber'}
                        >
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
