import React, { Dispatch, SetStateAction } from 'react'
import { FaBell, FaBellSlash, FaCheck, FaClock, FaTimes } from 'react-icons/fa'
import Countdown, { zeroPad } from 'react-countdown'
import toast from 'react-hot-toast'
import format from 'date-fns/formatDistanceStrict'
import { Howl } from 'howler'
import Slider, { SliderInner } from './Slider'
import relay from '../../utils/relay'
import { DiscordSettings, getDiscordColour, Settings } from '../../utils'

const bell = new Howl({
  src: ['sounds/pleasing-bell.ogg'],
})

const countDownRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a complete state
    return <div className="animate-pulse">Finished! Chat is paused, do the giveaway!</div>
  } else {
    // Render a countdown
    return (
      <span>
        {zeroPad(hours, 2)} : {zeroPad(minutes, 2)} : {zeroPad(seconds, 2)}
      </span>
    )
  }
}

const ONE_MIN = 1000 * 60

interface Props {
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  setChatPaused: Dispatch<SetStateAction<Boolean>>
  resetChat: () => void
  channelId?: string
  discordSettings: DiscordSettings
}

const StableCountdown = React.memo(function StableCountdown({
  value,
  onComplete,
}: {
  value: number
  onComplete: () => void
}) {
  return <Countdown renderer={countDownRenderer} date={Date.now() + value} onComplete={onComplete} />
})

const Time = React.memo(function Time({
  setChatPaused,
  resetChat,
  chatCommand,
  channelId,
  timerBell,
  setSettings,
  discordSettings,
}: {
  chatCommand: Props['settings']['chatCommand']
  timerBell: Props['settings']['timerBell']
  setSettings: Props['setSettings']
} & Pick<Props, 'channelId' | 'setChatPaused' | 'resetChat' | 'discordSettings'>) {
  const [active, setActive] = React.useState(false)
  const [value, setValue] = React.useState(ONE_MIN)
  const onComplete = React.useCallback(() => {
    toast.success('Timer finished! Chat paused, do a giveaway...', { position: 'bottom-center' })
    relay.emit('event', {
      type: 'timer-end',
      channelId,
      ts: new Date().toISOString(),
      discordGuildId: discordSettings.guildId,
      discordChannelId: discordSettings.channelId,
      discordColour: getDiscordColour(discordSettings.messageColour),
      discordTitle: discordSettings.endTitle,
      discordBody: discordSettings.endBody,
      discordEnabled: discordSettings.endEnabled,
    })
    setChatPaused(true)
    if (timerBell) bell.play()
  }, [channelId, timerBell])
  return active ? (
    <div className="flex-1 border border-purple-600 rounded-md flex justify-center items-center text-center relative">
      <StableCountdown value={value} onComplete={onComplete} />
      <FaTimes
        className="absolute right-3 top-2 text-red-500 select-none cursor-pointer"
        onClick={() => {
          setActive(false)
          relay.emit('event', { type: 'timer-cancel', channelId })
        }}
        title="Cancel the timer"
      />
    </div>
  ) : (
    <div className="flex-1 border border-purple-600 rounded-md flex relative">
      <div
        className="bg-purple-600 px-2 py-1 flex-0"
        title="Will clear chat, and then pause it after the time, to enable a giveaway with cut off"
      >
        Timer
      </div>
      <div className="px-2 flex-1 flex justify-center items-center">
        <SliderInner min={ONE_MIN} max={ONE_MIN * 30} value={value} step={ONE_MIN} onChange={setValue} />
      </div>
      <div className="flex-1 justify-center items-center text-center flex">
        {format(Date.now() + value, new Date())}
      </div>
      <button
        title="If enabled will play a sound at the end of the timer"
        className="flex justify-center items-center pr-3"
        onClick={() => setSettings((s) => ({ ...s, timerBell: !s.timerBell }))}
      >
        {timerBell ? <FaBell /> : <FaBellSlash />}
      </button>
      <button
        className="bg-purple-600 px-2 py-1 flex-0 select-none cursor-pointer flex flex-row justify-center items-center gap-1 transition-colors hover:bg-purple-700"
        onClick={() => {
          resetChat()
          setChatPaused(false)
          setActive(true)
          relay.emit('event', {
            type: 'timer-start',
            channelId,
            ts: new Date().toISOString(),
            chatCommand,
            discordGuildId: discordSettings.guildId,
            discordChannelId: discordSettings.channelId,
            discordColour: getDiscordColour(discordSettings.messageColour),
            discordTitle: discordSettings.startTitle,
            discordBody: discordSettings.startBody,
            discordEnabled: discordSettings.startEnabled,
          })
        }}
        title="Warning: will clear chat"
      >
        <FaClock /> Start
      </button>
    </div>
  )
})

export default function SettingsComponent({
  channelId,
  settings,
  setSettings,
  setChatPaused,
  resetChat,
  discordSettings,
}: Props) {
  return (
    <>
      <div className="flex flex-row gap-2 mt-2">
        <div className="flex flex-row justify-center items-center flex-1">
          <div
            className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md"
            title="This will be sent to chat by your account to tell winners, if Send Message is enabled below"
          >
            Winner Message
          </div>
          <input
            className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1"
            placeholder="Winner Message..."
            value={settings.winnerMessage}
            onChange={(e) => setSettings((s) => ({ ...s, winnerMessage: e.target.value }))}
            title="Chat command to enter - leave empty for none"
          />
        </div>
        <div className="flex flex-row justify-center items-center flex-1">
          <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md" title="Filters messages to include this">
            Chat Command
          </div>
          <input
            className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1"
            placeholder="Empty means any message..."
            value={settings.chatCommand}
            onChange={(e) => setSettings((s) => ({ ...s, chatCommand: e.target.value.trim() }))}
            title="Chat command to enter - leave empty for none"
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 mt-2">
        <div className="flex flex-1 flex-row gap-2">
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="Will limit winners to those who follow you, will slow down giveaways"
            >
              Followers Only
            </div>

            <button
              className="flex-1 text-2xl text-center justify-center items-center flex transition-opacity hover:opacity-60"
              onClick={() => setSettings((s) => ({ ...s, followersOnly: !s.followersOnly }))}
            >
              {settings.followersOnly ? <FaCheck /> : <FaTimes />}
            </button>
          </div>
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="If enabled, will send messages tagging winners in Twitch chat"
            >
              Send Message
            </div>

            <button
              className="flex-1 text-2xl text-center justify-center items-center flex transition-opacity hover:opacity-60"
              onClick={() => setSettings((s) => ({ ...s, sendMessages: !s.sendMessages }))}
            >
              {settings.sendMessages ? <FaCheck /> : <FaTimes />}
            </button>
          </div>
        </div>
        <Time
          setChatPaused={setChatPaused}
          resetChat={() => resetChat()}
          channelId={channelId}
          chatCommand={settings.chatCommand}
          timerBell={settings.timerBell}
          setSettings={setSettings}
          discordSettings={discordSettings}
        />
      </div>
      <div className="flex flex-row gap-2 mt-2">
        <Slider
          label="Sub Luck"
          title="Will enter subscribers this amount of times into the giveaways"
          value={settings.subLuck}
          min={1}
          max={10}
          onChange={(val) => setSettings((s) => ({ ...s, subLuck: val }))}
        />
        <Slider
          label="Winners"
          title="How many winners to draw per giveaway"
          value={settings.numberOfWinners}
          min={1}
          max={10}
          onChange={(val) => setSettings((s) => ({ ...s, numberOfWinners: val }))}
        />
        <Slider
          label="Spam Limit"
          title="How many messages of chat command if present before being removed from selection"
          value={settings.spamLimit || 1}
          min={1}
          max={10}
          onChange={(val) => setSettings((s) => ({ ...s, spamLimit: val }))}
          renderValue={(val) => <>{val === 1 ? 'Off' : `${val}+`}</>}
        />
      </div>
    </>
  )
}
