import React, { Dispatch, SetStateAction } from 'react'
import { ChatItem } from '../../chat'
import { Settings as TSettings, removeIdx, ChannelInfo, GiveawayResult } from '../../utils'
import chat from '../../chat'
import Settings from '../primitives/Settings'
import { Winner, InstantGiveaway, ChatGiveaway, WinnerUser } from '../primitives/giveaways'
import ChatBox from '../primitives/ChatBox'
import { FaPauseCircle, FaPlayCircle, FaTimesCircle } from 'react-icons/fa'

export default function MainScreen({
  chatEvents,
  settings,
  setSettings,
  channelInfo,
  client,
  chatPaused,
  setChatPaused,
  resetChat,
  winners,
  setWinners,
  setPastGiveaways,
}: {
  client: ReturnType<typeof chat> | null
  chatEvents: ChatItem[]
  settings: TSettings
  setSettings: Dispatch<SetStateAction<TSettings>>
  isConnected: boolean
  channelInfo: ChannelInfo
  chatPaused: boolean
  setChatPaused: Dispatch<SetStateAction<Boolean>>
  resetChat: () => void
  winners: WinnerUser[]
  setWinners: Dispatch<SetStateAction<WinnerUser[]>>
  setPastGiveaways: Dispatch<SetStateAction<GiveawayResult[]>>
}) {
  return (
    <>
      <Winner winners={winners} onClear={(idx) => setWinners((w) => removeIdx(w, idx))} />
      <div className="flex flex-row gap-2">
        <InstantGiveaway
          settings={settings}
          channelInfo={channelInfo}
          setWinners={setWinners}
          client={client}
          setPastGiveaways={setPastGiveaways}
        />
        <ChatGiveaway
          settings={settings}
          channelInfo={channelInfo}
          chatEvents={chatEvents}
          setWinners={setWinners}
          client={client}
          setPastGiveaways={setPastGiveaways}
        />
      </div>
      <Settings settings={settings} setSettings={setSettings} setChatPaused={setChatPaused} resetChat={resetChat} />
      {settings.performanceMode && !winners.length ? (
        <div className="flex justify-center items-center h-full gap-2 flex-row">
          <div>{chatEvents.length} messages</div>
          {chatPaused ? (
            <FaPlayCircle
              className="select-none cursor-pointer transition-opacity hover:opacity-70"
              onClick={() => setChatPaused((p) => !p)}
              title="Resume chat"
            />
          ) : (
            <FaPauseCircle
              className="select-none cursor-pointer  transition-opacity hover:opacity-70"
              onClick={() => setChatPaused((p) => !p)}
              title="Pause chat, misses messages while paused"
            />
          )}
          <FaTimesCircle
            className="text-red-500 select-none cursor-pointer  transition-opacity hover:opacity-70"
            onClick={() => resetChat()}
            title="Clear chat"
          />
        </div>
      ) : (
        <ChatBox
          chatEvents={chatEvents}
          winners={winners}
          paused={chatPaused}
          setPaused={setChatPaused}
          clear={resetChat}
          settings={settings}
          setSettings={setSettings}
        />
      )}
    </>
  )
}
