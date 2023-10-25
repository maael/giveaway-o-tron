import React from 'react'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import * as Sentry from '@sentry/react'
import chat, { ChatItem, useChatEvents } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import SetupScreen from './components/screens/Setup'
import PastGiveawaysScreen from './components/screens/PastGiveaways'
import SettingsScreen from './components/screens/Settings'
import Header from './components/primitives/Header'
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
} from './utils'
import { WinnerUser } from './components/primitives/giveaways'
import { useUpdateCheck } from './utils/updates'
import DiscordScreen from './components/screens/Discord'
import ObsScreen from './components/screens/Obs'

export default function App() {
  return (
    <Router initialEntries={['/setup']}>
      <InnerApp />
    </Router>
  )
}

function InnerApp() {
  useUpdateCheck()
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
    window['myApp'].setTitle(channelInfo.login, !!client)
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
          <SetupScreen resetChat={resetChat} setClient={setClient} channel={channelInfo} setChannel={setChannelInfo} />
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
      <Toaster />
    </>
  )
}
