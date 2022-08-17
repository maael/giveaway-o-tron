import React from 'react'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import chat, { ChatItem, useChatEvents, getCommandFromChat } from './chat'
import useStorage from './components/hooks/useStorage'
import MainScreen from './components/screens/Main'
import Header from './components/primitives/Header'
import { Settings } from './utils'

export default function App() {
  const [settings, setSettings] = useStorage<Settings>('settings', {
    autoConnect: true,
  })
  const [client, setClient] = React.useState<ReturnType<typeof chat> | null>(null)
  const [channel, setChannel] = useStorage('channel', '', (c) => (c ? setClient(chat(c)) : null))
  const onNewChat = React.useCallback((chat: ChatItem) => {
    console.info('[chat]', chat)
  }, [])
  const [chatEvents, resetChat] = useChatEvents(onNewChat)
  const chatEventsRef = React.useRef(chatEvents)
  React.useEffect(() => {
    chatEventsRef.current = chatEvents
  }, [chatEvents])
  React.useEffect(() => {
    window['myApp'].setTitle(channel, !!client)
  }, [channel, client])
  return (
    <Router initialEntries={['/']}>
      <Header client={client} resetChat={resetChat} setClient={setClient} channel={channel} setChannel={setChannel} />
      <Switch>
        <Route path="/">
          <MainScreen
            chatEvents={chatEvents}
            settings={settings}
            setSettings={setSettings}
            isConnected={!!client}
            channel={channel}
          />
        </Route>
      </Switch>
    </Router>
  )
}
