import React from 'react'
import cls from 'classnames'
import { ChatItem } from '../../chat'
import { WinnerUser } from '../primitives/giveaways'

export default function ChatBox({ chatEvents, winners }: { chatEvents: ChatItem[]; winners: WinnerUser[] }) {
  return (
    <>
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
                .filter((c) => (winners.length ? winners.map((c) => c.username).includes(c.username) : true))
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
