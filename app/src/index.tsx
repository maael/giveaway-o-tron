import React from 'react'
import ReactDom from 'react-dom'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import App from './App'
import twitchCache from './utils/twitchCaches'
import relay from './utils/relay'

Sentry.init({
  dsn: 'https://185864889dcb4a71961b896a59e09846@o304997.ingest.sentry.io/6745310',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  beforeSend(event) {
    if (event.message?.includes('Unable to connect.')) return null
    if (
      event.message?.includes('Cannot disconnect from server. Socket is not opened or connection is already closing.')
    ) {
      return null
    }
    return event
  },
})

Sentry.setTag('version', NL_APPVERSION)

window['myApp'] = {
  onWindowClose: async () => {
    try {
      const channelInfo = JSON.parse(await Neutralino.storage.getData(`main-channelinfo`))
      relay.emit('event', { type: 'timer-cancel', channelId: channelInfo?.userId })
    } catch (e) {
      Sentry.captureException(e)
    } finally {
      Neutralino.app.exit()
    }
  },
  setTitle: (channel: string, isActive: boolean) => {
    Neutralino.window.setTitle(['Giveaway-o-tron', channel, isActive ? '[Connected]' : ''].filter(Boolean).join(' - '))
  },
}

// Initialize native API communication. This is non-blocking
// use 'ready' event to run code on app load.
// Avoid calling API functions before init or after init.
Neutralino.init()

Neutralino.events.on('windowClose', window['myApp'].onWindowClose)

Neutralino.events.on('ready', async () => {
  try {
    const channelInfo = JSON.parse(await Neutralino.storage.getData(`main-channelinfo`))
    Sentry.setUser({ id: channelInfo?.userId, username: channelInfo?.login })
  } catch (e) {
    Sentry.captureException(e)
  } finally {
    void twitchCache()
    ReactDom.render(<App />, document.querySelector('#app'))
  }
})
