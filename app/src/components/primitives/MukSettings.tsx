import React from 'react'
import { FaTimesCircle, FaTrophy } from 'react-icons/fa'
import { announceWinner } from '~/utils'

const ALLOWED_LOGINS = ['mukluk', 'odialo']

export default function MukSettings(
  props: Pick<Parameters<typeof announceWinner>[0], 'channelInfo' | 'chatClient' | 'settings' | 'discordSettings'>
) {
  const fakeAnnounce = (str: string) => {
    announceWinner({
      channelInfo: props.channelInfo,
      chatClient: props.chatClient,
      settings: props.settings,
      discordSettings: props.discordSettings,
      giveawayType: 'chat',
      winner: str,
      force: true,
    })
  }
  return ALLOWED_LOGINS.includes(props.channelInfo?.login || '') ? (
    <div className="flex flex-row gap-2">
      <button
        title="A giveaway that includes all viewers who have chatted, optionally with a chat command if set"
        className="bg-purple-600 px-2 py-2 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-transform hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
        onClick={() => fakeAnnounce('Shy|$$|blocked')}
      >
        <FaTimesCircle /> Block Shy
      </button>
      <button
        title="A giveaway that includes all viewers who have chatted, optionally with a chat command if set"
        className="bg-purple-600 px-2 py-2 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-transform hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
        onClick={() => fakeAnnounce('Arilozen|$$|blocked')}
      >
        <FaTimesCircle /> Block Arilozen
      </button>
      <button
        title="A giveaway that includes all viewers who have chatted, optionally with a chat command if set"
        className="bg-purple-600 px-2 py-2 text-white rounded-md mt-2 overflow-hidden flex flex-row items-center justify-center text-center gap-1 flex-1 select-none transform transition-transform hover:translate-y-0.5 hover:scale-95 hover:bg-purple-700"
        onClick={() => fakeAnnounce('Flutegirl1|$$|rigged')}
      >
        <FaTrophy /> Rigged Mode
      </button>
    </div>
  ) : null
}
