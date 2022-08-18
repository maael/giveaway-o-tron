import React, { Dispatch, SetStateAction } from 'react'
import { FaCheck, FaClock, FaTimes } from 'react-icons/fa'
import Countdown, { zeroPad } from 'react-countdown'
import toast from 'react-hot-toast'
import format from 'date-fns/formatDistanceStrict'
import Slider, { SliderInner } from './Slider'
import { Settings } from '../../utils'

const countDownRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a complete state
    return <div className="animate-pulse">Finished! Chat is paused, just do the giveaway!</div>
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
}

const Time = React.memo(function Time({ setChatPaused, resetChat }: Pick<Props, 'setChatPaused' | 'resetChat'>) {
  const [active, setActive] = React.useState(false)
  const [value, setValue] = React.useState(ONE_MIN)
  return active ? (
    <div className="flex-1 border border-purple-600 rounded-md flex justify-center items-center text-center relative">
      <Countdown
        renderer={countDownRenderer}
        date={Date.now() + value}
        onComplete={() => {
          toast.success('Timer finished! Choosing winners...', { position: 'bottom-center' })
          setChatPaused(true)
        }}
      />
      <FaTimes
        className="absolute right-3 top-2 text-red-500 select-none cursor-pointer"
        onClick={() => setActive(false)}
        title="Cancel the timer"
      />
    </div>
  ) : (
    <div className="flex-1 border border-purple-600 rounded-md flex relative">
      <div className="bg-purple-600 px-2 py-1 flex-0">Timer</div>
      <div className="px-2 flex-1 flex justify-center items-center">
        <SliderInner min={ONE_MIN} max={ONE_MIN * 30} value={value} step={ONE_MIN} onChange={setValue} />
      </div>
      <div className="flex-1 justify-center items-center text-center flex">
        {format(Date.now() + value, new Date())}
      </div>
      <button
        className="bg-purple-600 px-2 py-1 flex-0 select-none cursor-pointer flex flex-row justify-center items-center gap-1"
        onClick={() => {
          resetChat()
          setActive(true)
        }}
      >
        <FaClock /> Start
      </button>
    </div>
  )
})

export default function SettingsComponent({ settings, setSettings, setChatPaused, resetChat }: Props) {
  return (
    <>
      <div className="flex flex-row gap-2 mt-2">
        <div className="flex flex-row justify-center items-center flex-1">
          <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md">Winner Message</div>
          <input
            className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1"
            placeholder="Winner Message..."
            value={settings.winnerMessage}
            onChange={(e) => setSettings((s) => ({ ...s, winnerMessage: e.target.value }))}
            title="Chat command to enter - leave empty for none"
          />
        </div>
        <div className="flex flex-row justify-center items-center flex-1">
          <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md">Chat Command</div>
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
        <div className="flex-1 border border-purple-600 rounded-md flex relative">
          <div className="bg-purple-600 px-2 py-1 flex-0">Followers Only</div>

          <button
            className="flex-1 text-2xl text-center justify-center items-center flex"
            onClick={() => setSettings((s) => ({ ...s, followersOnly: !s.followersOnly }))}
          >
            {settings.followersOnly ? <FaCheck /> : <FaTimes />}
          </button>
        </div>
        <Time setChatPaused={setChatPaused} resetChat={() => resetChat()} />
      </div>
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
      </div>
    </>
  )
}
