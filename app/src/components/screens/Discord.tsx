import React, { Dispatch, SetStateAction } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import format from 'date-fns/formatDistanceStrict'
import { DiscordSettings, ONE_MIN } from '~/utils'
import Checkbox from '../primitives/Checkbox'
import Input from '../primitives/Input'
import SliderOuter from '../primitives/Slider'

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
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex flex-row justify-center items-center gap-6">
          <Input
            outerClassName="flex-1"
            label="Message Colour"
            placeholder="Hex code..."
            value={settings.messageColour || ''}
            onChange={(e) => setSettings((s) => ({ ...s, messageColour: (e.target as any).value }))}
          />
          <SliderOuter
            label="Giveaway Alert Min Time"
            value={settings.giveawayMinTime || ONE_MIN}
            renderValue={(v) => <>{format(Date.now() + v, new Date())}</>}
            min={ONE_MIN}
            max={ONE_MIN * 30}
            onChange={(v) => setSettings((s) => ({ ...s, giveawayMinTime: v }))}
          />
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          <div className="flex-1 bg-purple-600 px-2 py-1 text-center rounded-md">Giveaway Start:</div>
          <Input
            outerClassName="flex-2"
            label="Title"
            placeholder="Title..."
            value={settings.startTitle || ''}
            onChange={(e) => setSettings((s) => ({ ...s, startTitle: (e.target as any).value }))}
          />
          <Input
            outerClassName="flex-3"
            label="Body"
            placeholder="Body..."
            value={settings.startBody || ''}
            onChange={(e) => setSettings((s) => ({ ...s, startBody: (e.target as any).value }))}
          />
          <Checkbox
            className="bg-purple-600 rounded-md h-full px-2 py-1"
            value={settings.startEnabled ?? true}
            name="startEnabled"
            onChange={setSettings}
            title="Enable Discord messages for starting giveaways"
          />
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          <div className="flex-1 bg-purple-600 px-2 py-1 text-center rounded-md">Giveaway End:</div>
          <Input
            outerClassName="flex-2"
            label="Title"
            placeholder="Title..."
            value={settings.endTitle || ''}
            onChange={(e) => setSettings((s) => ({ ...s, endTitle: (e.target as any).value }))}
          />
          <Input
            outerClassName="flex-3"
            label="Body"
            placeholder="Body..."
            value={settings.endBody || ''}
            onChange={(e) => setSettings((s) => ({ ...s, endBody: (e.target as any).value }))}
          />
          <Checkbox
            className="bg-purple-600 rounded-md h-full px-2 py-1"
            value={settings.endEnabled ?? true}
            name="endEnabled"
            onChange={setSettings}
            title="Enable Discord messages for ending giveaways"
          />
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          <div className="flex-1 bg-purple-600 px-2 py-1 text-center rounded-md">Winner:</div>
          <Input
            outerClassName="flex-2"
            label="Title"
            placeholder="Title..."
            value={settings.winnerTitle || ''}
            onChange={(e) => setSettings((s) => ({ ...s, winnerTitle: (e.target as any).value }))}
          />
          <Input
            outerClassName="flex-3"
            label="Body"
            placeholder="Body..."
            value={settings.winnerBody || ''}
            onChange={(e) => setSettings((s) => ({ ...s, winnerBody: (e.target as any).value }))}
          />
          <Checkbox
            className="bg-purple-600 rounded-md h-full px-2 py-1"
            value={settings.winnerEnabled ?? true}
            name="winnerEnabled"
            onChange={setSettings}
            title="Enable Discord messages for winners"
          />
        </div>
        <p className="px-2 mb-3 opacity-90 text-sm">
          You can mention roles with @rolename. Some special keywords you can include are:
        </p>
        <div className="flex flex-col gap-2 -mt-3 text-sm">
          <div className="flex flex-row gap-2 relative">
            <div className="w-1/5 flex justify-end items-start">
              <em className="not-italic px-3 py-1 bg-gray-700 text-purple-400 rounded-md">$winner</em>
            </div>
            <p className="flex flex-row items-center">Will be replaced by the winners username (title and body)</p>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/5 flex justify-end items-start">
              <em className="not-italic px-3 py-1 bg-gray-700 text-purple-400 rounded-md">$prize</em>
            </div>
            <p className="flex flex-row items-center">
              Will be replaced by the giveaway name if there is one (title and body)
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/5 flex justify-end items-start">
              <em className="not-italic px-3 py-1 bg-gray-700 text-purple-400 rounded-md">[any text]($link)</em>
            </div>
            <p className="flex flex-row items-center">
              Will be replaced by the text between the square brackets, linking to your Twitch (body only)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
