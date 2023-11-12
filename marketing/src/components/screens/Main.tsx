import React, { Dispatch, SetStateAction } from 'react'
import { ChatItem } from '../../chat'
import {
  Settings as TSettings,
  removeIdx,
  ChannelInfo,
  GiveawayResult,
  DiscordSettings,
  CacheStats,
  CacheHistory,
} from '../../utils'
import chat from '../../chat'
import Settings from '../primitives/Settings'
import { Winner, InstantGiveaway, ChatGiveaway, WinnerUser } from '../primitives/giveaways'
import ChatBox, { ChatControls } from '../primitives/ChatBox'
import formatDuration from 'date-fns/formatDuration'
import Stats from '../primitives/Stats'
import MukSettings from '../primitives/MukSettings'
import useCheckTwitchScopes from '../hooks/useCheckTwitchScopes'
import YoutubeWelcomeModal from '../primitives/YoutubeWelcomeModal'

export default function MainScreen({
  chatEvents,
  discordSettings,
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
  forfeits,
  stats,
  cacheHistory,
  setYoutubeChatDelay,
  getYoutubeChat,
  youtubeChatDelay,
}: {
  client: ReturnType<typeof chat> | null
  chatEvents: ChatItem[]
  discordSettings: DiscordSettings
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
  forfeits: string[]
  stats: CacheStats
  cacheHistory: CacheHistory
  setYoutubeChatDelay: Dispatch<SetStateAction<number | null>>
  getYoutubeChat: () => Promise<void>
  youtubeChatDelay: number | null
}) {
  const messageDelay = React.useMemo(() => {
    const mostRecent = chatEvents[chatEvents.length - 1]
    if (!mostRecent) return '0s delay'
    return `~${formatDuration({
      seconds: Number(((mostRecent.receivedTs - mostRecent.tmiTs) / 1000).toFixed(2)),
    }).replace(' seconds', 's')} delay`
  }, [chatEvents])
  useCheckTwitchScopes(channelInfo)
  return (
    <div className="flex flex-col flex-1">
      <YoutubeWelcomeModal />
      <Winner
        winners={winners}
        onClear={(idx) => setWinners((w) => removeIdx(w, idx))}
        chatClient={client}
        settings={settings}
        discordSettings={discordSettings}
        channelInfo={channelInfo}
      />
      <div className="flex flex-row gap-2">
        <InstantGiveaway
          discordSettings={discordSettings}
          settings={settings}
          channelInfo={channelInfo}
          setWinners={setWinners}
          client={client}
          setPastGiveaways={setPastGiveaways}
          forfeits={forfeits}
        />
        <ChatGiveaway
          discordSettings={discordSettings}
          settings={settings}
          channelInfo={channelInfo}
          chatEvents={chatEvents}
          setWinners={setWinners}
          client={client}
          setPastGiveaways={setPastGiveaways}
          forfeits={forfeits}
        />
      </div>
      <MukSettings
        discordSettings={discordSettings}
        settings={settings}
        chatClient={client}
        channelInfo={channelInfo}
      />
      <Settings
        channelId={channelInfo.userId}
        settings={settings}
        setSettings={setSettings}
        setChatPaused={setChatPaused}
        resetChat={resetChat}
        discordSettings={discordSettings}
        setYoutubeChatDelay={setYoutubeChatDelay}
        getYoutubeChat={getYoutubeChat}
      />
      {settings.performanceMode && !winners.length ? (
        <div className="h-full flex-1 gap-2 flex flex-col justify-center items-center">
          <div className="flex justify-center items-center gap-2 flex-row">
            <div>{chatEvents.length} messages</div>
            <ChatControls chatEvents={chatEvents} paused={chatPaused} setPaused={setChatPaused} clear={resetChat} />
          </div>
          <div>{messageDelay}</div>
        </div>
      ) : (
        <ChatBox
          messageDelay={messageDelay}
          chatEvents={chatEvents}
          winners={winners}
          paused={chatPaused}
          setPaused={setChatPaused}
          clear={resetChat}
          settings={settings}
          setSettings={setSettings}
          getYoutubeChat={getYoutubeChat}
          setYoutubeChatDelay={setYoutubeChatDelay}
          youtubeChatDelay={youtubeChatDelay}
        />
      )}
      <Stats stats={stats} cacheHistory={cacheHistory} />
    </div>
  )
}
