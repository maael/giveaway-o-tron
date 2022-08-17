import React from 'react'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import { v4 } from 'uuid'
import chat, { ChatItem, useChatEvents, getCommandFromChat } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import TeamsConfigScreen from './components/screens/TeamsConfigScreen'
import ControlsConfigScreen, { ControlConfig } from './components/screens/ControlsConfig'
import Header from './components/primitives/Header'
import { translateActionToCommand, getMatchedActions, Settings, getRandomArrayItem } from './utils'

/**
 * TODO: Audience division
 * TODO: Limit to application?
 * TODO: Test building and compiling for Windows
 */

const DEFAULT_CONTROLS: ControlConfig[] = [
  {
    id: v4(),
    name: 'Right Click',
    command: 'yep',
    actions: ['Right Click'],
    team: undefined,
  },
  {
    id: v4(),
    name: 'Left Click',
    command: 'lul',
    actions: ['Click'],
    team: undefined,
  },
  {
    id: v4(),
    name: 'Jump',
    command: 'mousey',
    actions: ['Space'],
    team: undefined,
  },
]

export default function App() {
  const [settings, setSettings] = useStorage<Settings>('settings', {
    waitDuration: 10,
    autoConnect: true,
    mode: 'democracy',
  })
  const [client, setClient] = React.useState<ReturnType<typeof chat> | null>(null)
  const [channel, setChannel] = useStorage('channel', '', (c) => (c ? setClient(chat(c)) : null))
  const [controls, setControls] = useStorage<ControlConfig[]>('controls', DEFAULT_CONTROLS)
  const [baron, setBaron] = useStorage<string | null>('baron', null)
  const onNewChat = React.useCallback(
    (chat: ChatItem) => {
      if (settings.mode === 'democracy') return
      let chatBaron = baron
      if (settings.mode === 'baron' && !chatBaron) {
        chatBaron = chat.displayName
        setBaron(chatBaron)
      }
      if (settings.mode === 'baron' && chat.displayName !== chatBaron) return
      const command = getCommandFromChat(controls, chat)
      translateActionToCommand(['default', command])
    },
    [settings.mode, controls, baron, setBaron]
  )
  const [chatEvents, resetChat] = useChatEvents(onNewChat)
  const chatEventsRef = React.useRef(chatEvents)
  const [lastCheckTime, setLastCheckTime] = React.useState<Date | null>(null)
  React.useEffect(() => {
    chatEventsRef.current = chatEvents
  }, [chatEvents])
  const [lastAction, setLastAction] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (settings.mode === 'anarchy') return
    const interval = setInterval(() => {
      if (settings.mode === 'democracy') {
        const actions = getMatchedActions(controls, chatEventsRef.current)
        const actionText = Object.entries(actions).map(translateActionToCommand).filter(Boolean).join(', ')
        setLastAction(actionText)
      } else if (settings.mode === 'baron') {
        const users = chatEventsRef.current.map((v) => v.displayName)
        setBaron(getRandomArrayItem(users))
      }
      setLastCheckTime(new Date())
      resetChat()
    }, settings.waitDuration * 1000)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [controls, settings.waitDuration, client, settings.mode, setBaron])
  React.useEffect(() => {
    setLastAction(null)
    setLastCheckTime(null)
    setBaron(null)
    resetChat()
  }, [settings.mode])
  React.useEffect(() => {
    window['myApp'].setTitle(channel, !!client)
    setBaron(null)
  }, [channel, client])
  return (
    <Router initialEntries={['/']}>
      <Header client={client} resetChat={resetChat} setClient={setClient} channel={channel} setChannel={setChannel} />
      <Switch>
        <Route path="/config/teams">
          <TeamsConfigScreen />
        </Route>
        <Route path="/config/controls">
          <ControlsConfigScreen controls={controls} setControls={setControls} />
        </Route>
        <Route path="/">
          <MainScreen
            baron={baron}
            chatEvents={chatEvents}
            lastAction={lastAction}
            settings={settings}
            setSettings={setSettings}
            controlCount={controls.length}
            lastCheckAt={lastCheckTime}
            isConnected={!!client}
            controls={controls}
          />
        </Route>
      </Switch>
    </Router>
  )
}
