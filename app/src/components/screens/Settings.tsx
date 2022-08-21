import * as React from 'react'
import { FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa'
import { removeIdx, Settings } from '~/utils'
import { APP_VERSION } from '~/utils/updates'

export default function SettingsScreen({
  settings,
  setSettings,
}: {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 flex-1">
      <h1 className="text-3xl">Settings</h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-2xl">
              Blocklist <small>({settings.blocklist.length})</small>
            </h2>
            <small className="text-m">These users will be excluded from giveaways</small>
          </div>
          <button
            className="border border-purple-600 rounded-md px-3 flex flex-row gap-1 justify-center items-center"
            onClick={() => setSettings((s) => ({ ...s, blocklist: (s.blocklist || []).concat('') }))}
          >
            <FaPlus /> Add Item
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(settings.blocklist || []).map((u, i) => (
            <div className="relative flex-1" key={u}>
              <input
                className="bg-gray-700 px-2 py-1 rounded-md border-b border-purple-500 w-full overflow-ellipsis"
                placeholder="Name..."
                value={u}
                onChange={(e) =>
                  setSettings((s) => {
                    const list = s.blocklist
                    list[i] = e.target.value
                    return { ...s, blocklist: list }
                  })
                }
                title="Chat command to enter - leave empty for none"
              />
              <button
                className="text-red-600 absolute right-2 top-1.5 text-xl"
                onClick={() => setSettings((s) => ({ ...s, blocklist: removeIdx(s.blocklist, i) }))}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-end">
        <div className="flex-1">
          <button
            className="text-purple-200 opacity-80 text-xs"
            onClick={() => Neutralino.os.open(`https://github.com/maael/giveaway-o-tron/releases/v${APP_VERSION}`)}
          >
            Version: {APP_VERSION ? `v${APP_VERSION}` : 'Unknown Version'}
          </button>
        </div>
        <button
          className="bg-red-600 px-3 py-1 rounded-md opacity-50 hover:opacity-100 flex justify-center items-center gap-1 transition-opacity"
          onClick={async () => {
            await Neutralino.storage.setData('main-channelinfo', null)
            window.location.reload()
          }}
        >
          <FaExclamationTriangle /> Reset Channel Info
        </button>
      </div>
    </div>
  )
}
