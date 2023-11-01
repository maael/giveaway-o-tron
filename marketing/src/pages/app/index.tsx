import React from 'react'
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

function useYoutubeChat() {
  const session = useSession()
  React.useEffect(() => {
    ;(async () => {
      if (session.data?.youtube?.accessToken) {
        console.info('[youtube] Start')
        const data = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?mine=true', {
          headers: { Authorization: `Bearer ${session.data?.youtube?.accessToken}` },
        }).then((r) => r.json())
        console.info('[youtube] Data', data)
      }
    })()
  }, [session?.data?.youtube?.accessToken])
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
  useYoutubeChat()
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
  const [chatEvents, resetChat] = useChatEvents(chatPaused, winners, onNewChat)
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
