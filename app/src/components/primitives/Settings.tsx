import React, { Dispatch, SetStateAction } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import Slider from './Slider'
import { Settings } from '../../utils'

export default function SettingsComponent({
  settings,
  setSettings,
}: {
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
}) {
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
      </div>
    </>
  )
}
