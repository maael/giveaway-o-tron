import React, { Dispatch, SetStateAction } from 'react'
import cls from 'classnames'
import toast from 'react-hot-toast'
import format from 'date-fns/format'
import { ChatItem } from '../../chat'
import { WinnerUser } from '../primitives/giveaways'
import {
  FaCheck,
  FaExclamationTriangle,
  FaPauseCircle,
  FaPlayCircle,
  FaSave,
  FaSearch,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa'
import { Settings } from '~/utils'

function isVisibleIn(ele: HTMLElement, container: HTMLElement, buffer: number = 50) {
  const eleTop = ele.offsetTop
  const eleBottom = eleTop + ele.clientHeight

  const containerTop = container.scrollTop
  const containerBottom = containerTop + container.clientHeight + buffer

  // The element is fully visible in the container
  return (
    (eleTop >= containerTop && eleBottom <= containerBottom) ||
    // Some part of the element is visible in the container
    (eleTop < containerTop && containerTop < eleBottom) ||
    (eleTop < containerBottom && containerBottom < eleBottom)
  )
}

export function ChatControls({
  chatEvents,
  paused,
  setPaused,
  clear,
}: Pick<Props, 'chatEvents' | 'paused' | 'setPaused' | 'clear'>) {
  return (
    <>
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
      <FaSave
        className="select-none cursor-pointer  transition-opacity hover:opacity-70"
        title="Saves all messages (not just those shown)"
        onClick={async () => {
          const ts = format(new Date(), 'yyyy-MM-dd--HH-mm-ss')
          await Neutralino.storage.setData(`${ts}-chat`, JSON.stringify(chatEvents, undefined, 2))
          toast.success(`Saved ${chatEvents.length} messages`, { position: 'bottom-right' })
        }}
      />
    </>
  )
}

interface Props {
  chatEvents: ChatItem[]
  winners: WinnerUser[]
  paused: boolean
  setPaused: Dispatch<SetStateAction<boolean>>
  clear: () => void
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  messageDelay: string
}

export default function ChatBox({
  chatEvents,
  winners,
  paused,
  setPaused,
  clear,
  settings,
  setSettings,
  messageDelay,
}: Props) {
  const shouldAutoScroll = settings.autoScroll ?? true
  const limitedMessages = chatEvents.filter((c) =>
    winners.length
      ? winners.flatMap((c) => [c.username].concat(c.otherUsersWithEntry || [])).includes(c.username)
      : true
  )
  const chatBottomRef = React.useRef<null | HTMLDivElement>(null)
  const chatRef = React.useRef<null | HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (chatRef.current && chatBottomRef.current) {
      const shouldScroll = isVisibleIn(chatBottomRef.current, chatRef.current)
      if (shouldScroll && shouldAutoScroll) {
        chatBottomRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }
  }, [limitedMessages, shouldAutoScroll])
  const [search, setSearch] = React.useState('')
  const searchedMessages = search
    ? limitedMessages.filter(
        (m) =>
          m.username.toLowerCase().includes(search.toLowerCase()) || m.msg.toLowerCase().includes(search.toLowerCase())
      )
    : limitedMessages
  return (
    <>
      <div className="mt-2 rounded-md bg-gray-700 flex-1 flex flex-col relative overflow-hidden">
        <div className="bg-gray-600 h-8 gap-2 flex justify-between px-5 items-center text-white z-50">
          <div className="flex flex-row justify-center items-center flex-1 text-xs">
            <div
              className="flex-0 bg-purple-600 px-2 py-1.5 border border-purple-600 rounded-l-md"
              title="This will be sent to chat by your account to tell winners, if Send Message is enabled below"
            >
              <FaSearch />
            </div>
            <input
              className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-600 flex-1"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              title="Search chat"
            />
          </div>

          <div className="flex-1">
            {chatEvents.length} message{chatEvents.length === 1 ? '' : 's'}
          </div>

          <div className="flex-1 text-yellow-600 text-xs">
            {winners.length ? (
              <>
                {limitedMessages.length} winner message{limitedMessages.length === 1 ? '' : 's'}
              </>
            ) : null}
          </div>
          <div className="flex flex-row justify-center items-center gap-2 text-xl flex-2">
            <div className="text-xs text-center">{messageDelay}</div>
            <button
              className={cls(
                'text-xs flex justify-center items-center gap-1 border border-purple-600 px-2 py-1 rounded-md',
                {
                  'bg-purple-600': shouldAutoScroll,
                }
              )}
              onClick={() => setSettings((s) => ({ ...s, autoScroll: !s.autoScroll }))}
            >
              {shouldAutoScroll ? <FaCheck /> : <FaTimes />} Following
            </button>
            <ChatControls chatEvents={chatEvents} paused={paused} setPaused={setPaused} clear={clear} />
          </div>
        </div>
        <div className="relative flex-1">
          {chatEvents.length === 0 ? (
            <span className={cls('absolute inset-0 text-center flex justify-center items-center')}>
              Logs will appear here...
            </span>
          ) : (
            <div
              className={cls('absolute overflow-y-auto inset-0 px-2 pt-1 pb-3 flex flex-col gap-1 h-full')}
              ref={chatRef}
            >
              {searchedMessages.map((c) => {
                const hasWarning =
                  winners.length > 0 && winners.some((w) => (w.otherUsersWithEntry || []).includes(c.username))
                return (
                  <div
                    key={c.id}
                    className={cls('relative', { 'bg-yellow-500 bg-opacity-60 rounded-md px-1': hasWarning })}
                  >
                    <span className="text-xs mr-0.5">[{c.formattedTmiTs}]</span>
                    <span
                      className={cls('rounded-full bg-gray-300 h-4 w-4 inline-block relative', {
                        'bg-yellow-500': c.isSubscriber,
                        'bg-purple-600': c.isMod,
                        'top-1': !c.isSubscriber && !c.isMod,
                      })}
                    >
                      {c.isMod ? (
                        <span
                          className="flex justify-center items-center text-xs cursor-default select-none"
                          title={'Mod'}
                        >
                          M
                        </span>
                      ) : c.isSubscriber ? (
                        <span
                          className="flex justify-center items-center text-xs cursor-default select-none"
                          title={'Subscriber'}
                        >
                          S
                        </span>
                      ) : null}
                    </span>
                    <span className="mx-0.5" style={{ color: c.color }}>
                      [{c.displayName}]
                    </span>{' '}
                    {c.msg}
                    {hasWarning ? (
                      <FaExclamationTriangle
                        className="text-lg top-0.5 right-1.5 absolute cursor-help"
                        title="This user submitted an entry matching a winner"
                      />
                    ) : null}
                  </div>
                )
              })}
              <div ref={chatBottomRef}></div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
