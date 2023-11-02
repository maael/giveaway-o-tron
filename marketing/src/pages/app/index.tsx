import React, { useState } from 'react'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import chat, { ChatItem, useChatEvents } from '~/chat'
import useStorage from '~/components/hooks/useStorage'
import MainScreen from '~/components/screens/Main'
import SetupScreen from '~/components/screens/Setup'
import PastGiveawaysScreen from '~/components/screens/PastGiveaways'
import SettingsScreen from '~/components/screens/Settings'
import Header from '~/components/primitives/Header'
import useSession, { SessionProvider } from '~/components/hooks/useSession'
import {
  ChannelInfo,
  defaultDiscordSettings,
  defaultSettings,
  DiscordSettings,
  GiveawayResult,
  Settings,
  useAuthEvents,
  useCacheHistory,
  useCacheStats,
  validateToken,
} from '~/utils'
import { WinnerUser } from '~/components/primitives/giveaways'
import DiscordScreen from '~/components/screens/Discord'
import ObsScreen from '~/components/screens/Obs'
import twitchCache from '~/utils/twitchCaches'
import * as Sentry from '@sentry/nextjs'
import format from 'date-fns/format'
import stringToColour from 'string-to-color'

if (typeof window !== undefined) {
  void twitchCache()
}

export default function App() {
  return (
    <SessionProvider>
      <Router initialEntries={['/setup']}>
        <InnerApp />
      </Router>
    </SessionProvider>
  )
}

interface YoutubeStream {
  id?: string
  channelId?: string
  title?: string
  chatId?: string
}

async function getAndSetYoutubeChat(
  accessToken: string,
  chatId: string,
  setChat: React.Dispatch<React.SetStateAction<ChatItem[]>>,
  nextPageToken?: string
) {
  console.info('[youtube] Getting chat')
  const data = await fetch(
    `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&part=snippet,authorDetails${
      nextPageToken ? `&pageToken=${nextPageToken}` : ''
    }`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  ).then((r) => r.json())
  console.info('[youtube] what', data)
  const chatItems: ChatItem[] = data?.items
    .filter((i) => i.snippet.type === 'textMessageEvent')
    .map((i) => ({
      id: i.id,
      color: stringToColour(i.authorDetails.displayName),
      displayName: i.authorDetails.displayName,
      isSubscriber: false,
      turbo: false,
      username: i.authorDetails.displayName,
      type: i.snippet.type,
      msg: i.snippet.displayMessage,
      returningChatter: false,
      firstMessage: false,
      isMod: i.authorDetails.isChatModerator,
      userId: i.authorDetails.channelId,
      tmiTs: +new Date(i.snippet.publishedAt),
      receivedTs: Date.now(),
      formattedTmiTs: format(new Date(i.snippet.publishedAt), 'HH:mm:ss'),
      source: 'youtube',
    }))
  console.info('[youtube] Chat', data)
  setChat((c) => {
    const chatIds = new Set(c.map((c) => c.id))
    const newItems = chatItems.filter((i) => !chatIds.has(i.id))
    return c.concat(newItems)
  })
  setTimeout(() => getAndSetYoutubeChat(accessToken, chatId, setChat, data.nextPageToken), data.pollingIntervalMillis)
}

function useYoutubeChat(setChat: React.Dispatch<React.SetStateAction<ChatItem[]>>) {
  const session = useSession()
  const [youtubeStream, setYoutubeStream] = useState<YoutubeStream>()
  React.useEffect(() => {
    ;(async () => {
      if (session.data?.youtube?.accessToken) {
        console.info('[youtube] Start')
        const data = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?mine=true', {
          headers: { Authorization: `Bearer ${session.data?.youtube?.accessToken}` },
        }).then((r) => r.json())
        const streamInfoRaw = (data.items || [])[0]
        const streamInfo = {
          id: streamInfoRaw?.id,
          channelId: streamInfoRaw?.snippet.channelId,
          title: streamInfoRaw?.snippet.title,
          chatId: streamInfoRaw?.snippet.liveChatId,
        }
        console.info('[youtube] Data', streamInfo)
        setYoutubeStream(streamInfo)
      }
    })()
  }, [session?.data?.youtube?.accessToken])

  React.useEffect(() => {
    ;(async () => {
      if (youtubeStream?.chatId && session?.data?.youtube?.accessToken) {
        void getAndSetYoutubeChat(session?.data?.youtube?.accessToken, youtubeStream?.chatId, setChat)
      }
    })()
  }, [session?.data?.youtube?.accessToken, youtubeStream, setChat])
}

function useHandleLogin(channelInfo: ChannelInfo, setChannelInfo: any) {
  const session = useSession()
  React.useEffect(() => {
    if (session.status === 'unauthenticated') {
      window.location.href = '/api/auth/twitch'
    }
  }, [session.status, channelInfo.token])
  React.useEffect(() => {
    const data = session.data as any
    if (session.status === 'authenticated' && data) {
      ;(async () => {
        const sessionData = session.data?.twitch as any
        console.info('[handlelogin][validateToken]', sessionData)
        const data = await validateToken(sessionData.accessToken, sessionData.refreshToken)
        setChannelInfo(data)
      })()
    }
  }, [session.status])
}

function InnerApp() {
  const [settings, setSettings] = useStorage<Settings>('settings', defaultSettings)
  const [discordSettings, setDiscordSettings] = useStorage<DiscordSettings>('discord', defaultDiscordSettings)
  const [winners, setWinners] = React.useState<WinnerUser[]>([])
  const [client, setClient] = React.useState<ReturnType<typeof chat> | null>(null)
  const [channelInfo, setChannelInfo] = useStorage<ChannelInfo>('channelInfo', {}, (c) => {
    console.info('[client][app]', c)
    if (!c.login) return null
    console.info('[client][app][startClient]')
    if (settings.autoConnect) setClient((cl) => (cl ? cl : chat(c)))
  })
  useHandleLogin(channelInfo, setChannelInfo)
  const updateClientInfo = React.useCallback(
    (d) => {
      console.info('[auth][client][update]', d)
      setChannelInfo(d)
      if (client?.readyState() === 'OPEN') {
        try {
          client.disconnect()
        } catch (e) {
          console.warn('[app-disconnect]', e)
        }
      }
      client?.removeAllListeners()
      setClient(chat(d))
    },
    [client]
  )
  useAuthEvents(updateClientInfo)
  React.useEffect(() => {
    Sentry.setUser({ username: channelInfo.login })
    if (channelInfo.login) {
      if (settings.autoConnect) setClient((cl) => (cl ? cl : chat(channelInfo)))
    }
  }, [channelInfo.login])
  const [forfeits, setForfeits] = React.useState<string[]>([])
  const onNewChat = React.useCallback(
    (chat: ChatItem) => {
      if (settings.forfeitCommand && chat.msg.toLowerCase().includes(settings.forfeitCommand.toLowerCase())) {
        setForfeits((f) => f.concat(chat.username))
      }
    },
    [settings.forfeitCommand]
  )
  const [chatPaused, setChatPaused] = React.useState(false)
  const [chatEvents, resetChat, setChat] = useChatEvents(chatPaused, winners, onNewChat)
  useYoutubeChat(setChat)
  React.useEffect(() => {
    document.title = [channelInfo.login, 'Giveaway-o-tron'].join(' - ')
  }, [channelInfo.login, client])
  const [pastGiveaways, setPastGiveaways] = useStorage<GiveawayResult[]>('past-giveaways', [])
  const stats = useCacheStats()
  const cacheHistory = useCacheHistory(stats)
  return (
    <>
      <Header client={client} resetChat={resetChat} setClient={setClient} channelInfo={channelInfo} />
      <Switch>
        <Route path="/" exact>
          <MainScreen
            client={client}
            chatEvents={chatEvents}
            discordSettings={discordSettings}
            settings={settings}
            setSettings={setSettings}
            isConnected={!!client}
            channelInfo={channelInfo}
            chatPaused={chatPaused}
            setChatPaused={setChatPaused}
            resetChat={resetChat}
            winners={winners}
            setWinners={setWinners}
            setPastGiveaways={setPastGiveaways}
            forfeits={forfeits}
            stats={stats}
            cacheHistory={cacheHistory}
          />
        </Route>
        <Route path="/setup" exact>
          <SetupScreen channel={channelInfo} />
        </Route>
        <Route path="/giveaways" exact>
          <PastGiveawaysScreen giveaways={pastGiveaways} setPastGiveaways={setPastGiveaways} />
        </Route>
        <Route path="/settings" exact>
          <SettingsScreen settings={settings} setSettings={setSettings} forfeits={forfeits} setForfeits={setForfeits} />
        </Route>
        <Route path="/discord" exact>
          <DiscordScreen settings={discordSettings} setSettings={setDiscordSettings} />
        </Route>
        <Route path="/obs" exact>
          <ObsScreen channelInfo={channelInfo} settings={settings} setSettings={setSettings} />
        </Route>
      </Switch>
    </>
  )
}
