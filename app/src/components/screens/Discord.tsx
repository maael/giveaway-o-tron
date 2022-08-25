import React, { Dispatch, SetStateAction } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import { DiscordSettings } from '~/utils'
import Input from '../primitives/Input'

export default function Discord({
  settings,
  setSettings,
}: {
  settings: DiscordSettings
  setSettings: Dispatch<SetStateAction<DiscordSettings>>
}) {
  return (
    <div className="mt-2 flex flex-col gap-2 flex-1">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl">Discord</h1>
        <button
          className="bg-purple-600 text-white py-1 px-5 rounded-md transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 justify-center text-xl mt-2"
          onClick={() => {
            Neutralino.os.open(
              'https://discord.com/api/oauth2/authorize?client_id=1012331926301974558&permissions=150528&scope=bot'
            )
          }}
        >
          <FaEnvelope /> Invite Bot
        </button>
      </div>
      <div className="flex flex-row gap-2">
        <Input
          label="Server ID"
          placeholder="ID..."
          value={settings.guildId || ''}
          onChange={(e) => setSettings((s) => ({ ...s, guildId: (e.target as any).value }))}
        />
        <Input
          label="Channel ID"
          placeholder="ID..."
          value={settings.channelId || ''}
          onChange={(e) => setSettings((s) => ({ ...s, channelId: (e.target as any).value }))}
        />
      </div>
      <p className="text-sm opacity-90 text-center">
        After inviting the bot using the button above, find these IDs by:
      </p>
      <ol className="text-sm list-decimal max-w-md mx-auto opacity-90 -mt-1">
        <li>In Discord, go to settings</li>
        <li>Go to Appearance, Advanced, and enable Developer Mode</li>
        <li>Right click on your Discord Server icon in the sidebar, and select Copy ID, and paste above</li>
        <li>Do the same again but for a channel</li>
      </ol>
      <h1 className="text-xl">Message Settings</h1>
      <div className="flex flex-col gap-2">
        <Input
          label="Message Colour"
          placeholder="Hex code..."
          value={settings.messageColour || ''}
          onChange={(e) => setSettings((s) => ({ ...s, messageColour: (e.target as any).value }))}
        />
        <Input
          label="Message Title"
          placeholder="Title..."
          value={settings.messageTitle || ''}
          onChange={(e) => setSettings((s) => ({ ...s, messageTitle: (e.target as any).value }))}
        />
        <Input
          label="Message Body"
          placeholder="Body..."
          value={settings.messageBody || ''}
          onChange={(e) => setSettings((s) => ({ ...s, messageBody: (e.target as any).value }))}
        />
        <p className="px-2 mb-3 opacity-90 text-sm">Some special keywords you can include are:</p>
        <div className="flex flex-col gap-2 -mt-3 text-sm">
          <div className="flex flex-row gap-2 relative">
            <div className="w-1/5 flex justify-end items-start">
              <em className="not-italic px-3 py-1 bg-gray-700 text-purple-400 rounded-md">$winner</em>
            </div>
            <p className="flex flex-row items-center">Will be replaced by the winners username</p>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/5 flex justify-end items-start">
              <em className="not-italic px-3 py-1 bg-gray-700 text-purple-400 rounded-md">$prize</em>
            </div>
            <p className="flex flex-row items-center">Will be replaced by the giveaway name if there is one</p>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/5 flex justify-end items-start">
              <em className="not-italic px-3 py-1 bg-gray-700 text-purple-400 rounded-md">[any text]($link)</em>
            </div>
            <p className="flex flex-row items-center">
              Will be replaced by the text between the square brackets, linking to your Twitch
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
