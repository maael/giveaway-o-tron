import React, { Dispatch, SetStateAction } from 'react'
import cls from 'classnames'
import { GiPartyPopper } from 'react-icons/gi'
import { ChatItem } from '../../chat'
import { Settings, getInstantGiveaway, getChatGiveaway, removeIdx, ChannelInfo } from '../../utils'
import { FaCheck, FaDice, FaTimes } from 'react-icons/fa'
import { Range, getTrackBackground } from 'react-range'

function Slider({
  value,
  label,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (val: number) => void
}) {
  const values = [value]
  return (
    <div className="flex-1 px-3">
      <div>
        {label}: {values[0]}
      </div>
      <div className="mt-3 mb-4">
        <Range
          min={min}
          max={max}
          step={1}
          values={values}
          onChange={(values) => onChange(values[0])}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#7c3aed', '#9ca3af'],
                  min,
                  max,
                  rtl: false,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '20px',
                width: '20px',
                borderRadius: '4px',
                backgroundColor: '#FFF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 2px 6px #AAA',
              }}
            />
          )}
        />
      </div>
    </div>
  )
}

function Settings({ settings, setSettings }: { settings: Settings; setSettings: Dispatch<SetStateAction<Settings>> }) {
  return (
    <div className="flex flex-row gap-2 mt-2">
      <Slider
        label="Sub Luck"
        value={settings.subLuck}
        min={1}
        max={10}
        onChange={(val) => setSettings((s) => ({ ...s, subLuck: val }))}
      />
      <Slider
        label="Number of Winners"
        value={settings.numberOfWinners}
        min={1}
        max={10}
        onChange={(val) => setSettings((s) => ({ ...s, numberOfWinners: val }))}
      />
      <div className="flex-1 flex flex-row justify-center items-center gap-2">
        Followers Only:
        <button
          className="rounded-md p-1 border border-white text-2xl"
          onClick={() => setSettings((s) => ({ ...s, followersOnly: !s.followersOnly }))}
        >
          {settings.followersOnly ? <FaCheck /> : <FaTimes />}
        </button>
      </div>
      <div className="flex flex-col justify-center items-center">
        <input
          className="bg-gray-700 px-2 py-1 rounded-md border-b border-purple-500"
          placeholder="Chat command..."
          value={settings.chatCommand}
          onChange={(e) => setSettings((s) => ({ ...s, chatCommand: e.target.value.trim() }))}
          title="Chat command to enter - leave empty for none"
        />
      </div>
    </div>
  )
}

function InstantGiveaway({
  setWinners,
  channelInfo,
  settings,
}: {
  setWinners: Dispatch<SetStateAction<Winner[]>>
  channelInfo: ChannelInfo
  settings: Settings
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none"
      onClick={async () => {
        if (!channelInfo.login) return
        const giveawayWinner = await getInstantGiveaway(
          channelInfo,
          settings.subLuck,
          settings.followersOnly,
          settings.numberOfWinners
        )
        if (!giveawayWinner.length) return
        setWinners((w) => w.concat(giveawayWinner.map((u) => ({ username: u }))))
      }}
    >
      <FaDice className="text-2xl" /> Viewers Instant Giveaway
    </button>
  )
}

function ChatGiveaway({
  chatEvents,
  setWinners,
  channelInfo,
  chatCommand,
  settings,
}: {
  chatEvents: ChatItem[]
  setWinners: Dispatch<SetStateAction<Winner[]>>
  channelInfo: ChannelInfo
  chatCommand: string
  settings: Settings
}) {
  return (
    <button
      className="bg-purple-600 px-2 py-4 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none"
      onClick={async () => {
        const giveawayWinner = await getChatGiveaway(
          channelInfo,
          chatEvents,
          chatCommand,
          settings.subLuck,
          settings.followersOnly,
          settings.numberOfWinners
        )
        if (!giveawayWinner) return
        setWinners((w) => w.concat(giveawayWinner))
      }}
    >
      <FaDice className="text-2xl" /> Active Chatter Giveaway
    </button>
  )
}

type Winner = Partial<{
  username: string
  id: string
  isSubscriber: boolean
  isFollower: boolean
}>
function Winner({ winners, onClear }: { winners: Winner[]; onClear: (idx: number) => void }) {
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

export default function MainScreen({
  chatEvents,
  settings,
  setSettings,
  channelInfo,
}: {
  chatEvents: ChatItem[]
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  isConnected: boolean
  channelInfo: ChannelInfo
}) {
  const [winners, setWinners] = React.useState<Winner[]>([])
  const [chatCommand, setChatCommand] = React.useState('')
  return (
    <>
      <Winner winners={winners} onClear={(idx) => setWinners((w) => removeIdx(w, idx))} />
      <div className="flex flex-row gap-2">
        <InstantGiveaway settings={settings} channelInfo={channelInfo} setWinners={setWinners} />
        <ChatGiveaway
          settings={settings}
          channelInfo={channelInfo}
          chatEvents={chatEvents}
          setWinners={setWinners}
          chatCommand={chatCommand}
        />
      </div>
      <Settings settings={settings} setSettings={setSettings} />
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
