import * as React from 'react'
import { FaCheck, FaDownload, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa'
import { removeIdx, Settings } from '~/utils'
import { APP_VERSION, checkForUpdate } from '~/utils/updates'

export default function SettingsScreen({
  settings,
  setSettings,
  forfeits,
  setForfeits,
}: {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  forfeits: string[]
  setForfeits: React.Dispatch<React.SetStateAction<string[]>>
}) {
  return (
    <div className="mt-2 flex flex-col gap-3 flex-1 pb-2">
      <h1 className="text-3xl -mb-1">Settings</h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-xl">
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
        <div className="grid grid-cols-4 gap-2 text-sm">
          {(settings.blocklist || []).map((u, i) => (
            <div className="relative flex-1" key={i}>
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
                title="Account name to block from winner giveaways"
              />
              <button
                className="text-red-600 absolute right-1.5 top-1.5 text-xl"
                onClick={() => setSettings((s) => ({ ...s, blocklist: removeIdx(s.blocklist, i) }))}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-xl">Performance Mode</h2>
            <small className="text-m">
              Will hide chat when there are no winners, and disable chat scroll following
            </small>
          </div>
        </div>
        <div className="flex-1 border border-purple-600 rounded-md flex relative">
          <div
            className="bg-purple-600 px-2 py-1 flex-0"
            title="If enabled, will send messages tagging winners in Twitch chat"
          >
            Enabled?
          </div>

          <button
            className="flex-1 text-2xl text-center justify-center items-center flex transition-opacity hover:opacity-60"
            onClick={() => setSettings((s) => ({ ...s, performanceMode: !s.performanceMode }))}
          >
            {settings.performanceMode ? <FaCheck /> : <FaTimes />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-xl">Giveaway Forfeit Command</h2>
            <small className="text-m">
              If a user types anything that matchs this command, they will forfeit winner any command, until list is
              cleared. No spaces.
            </small>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-row justify-center items-center flex-1">
            <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md" title="Filters messages to include this">
              Forfeit Command
            </div>
            <input
              className="bg-gray-700 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1"
              placeholder="Empty means no forfeits..."
              value={settings.forfeitCommand || ''}
              onChange={(e) => setSettings((s) => ({ ...s, forfeitCommand: e.target.value.trim() }))}
              title="Forfeit command..."
            />
          </div>
          <div className="flex-0 bg-purple-600 px-2 py-1 rounded-md flex justify-center items-center">
            Number of forfeits: {forfeits.length}
          </div>
          <button
            className="flex-0 bg-red-600 px-2 py-1 rounded-md flex justify-center items-center gap-1"
            onClick={() => setForfeits([])}
          >
            <FaTimes /> Reset List
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-xl">Alert/Message Settings</h2>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="If enabled, will automatically send the alert and chat message, otherwise you have to manually send them"
            >
              Auto Announce
            </div>

            <button
              className="flex-1 text-2xl text-center justify-center items-center flex transition-opacity hover:opacity-60"
              onClick={() =>
                setSettings((s) => ({ ...s, autoAnnounce: s.autoAnnounce === undefined ? false : !s.autoAnnounce }))
              }
            >
              {settings.autoAnnounce || settings.autoAnnounce === undefined ? <FaCheck /> : <FaTimes />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-end gap-2">
        <div className="flex-1">
          <button
            className="text-purple-200 opacity-80 text-xs"
            onClick={() => Neutralino.os.open(`https://github.com/maael/giveaway-o-tron/releases/v${APP_VERSION}`)}
          >
            Version: {APP_VERSION ? `v${APP_VERSION}` : 'Unknown Version'}
          </button>
        </div>
        <button
          className="bg-purple-600 px-3 py-1 rounded-md opacity-50 hover:opacity-100 flex justify-center items-center gap-1 transition-opacity text-xs"
          onClick={async () => {
            await checkForUpdate()
          }}
        >
          <FaDownload /> Check for update
        </button>
        <button
          className="bg-red-600 px-3 py-1 rounded-md opacity-50 hover:opacity-100 flex justify-center items-center gap-1 transition-opacity text-xs"
          onClick={async () => {
            Neutralino.os.open(`https://giveaway-o-tron.vercel.app/api/auth/signout`)
          }}
        >
          <FaExclamationTriangle /> Sign Out Token Tool
        </button>
        <button
          className="bg-red-600 px-3 py-1 rounded-md opacity-50 hover:opacity-100 flex justify-center items-center gap-1 transition-opacity text-xs"
          onClick={async () => {
            try {
              await Neutralino.storage.setData('main-channelinfo', null)
              await await Neutralino.filesystem.readDirectory(`${NL_CWD}/.storage/main-channelinfo.neustorage`)
              await Neutralino.app.restartProcess({ args: '--restarted' })
            } catch {
              await Neutralino.app.restartProcess({ args: '--restarted' })
            }
          }}
        >
          <FaExclamationTriangle /> Reset Channel Info
        </button>
      </div>
    </div>
  )
}
