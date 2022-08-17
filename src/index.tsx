import React from 'react'
import ReactDom from 'react-dom'
import App from './App'
import { setInstance, getInstance } from './utils'

const CHILD_FLAG_PREFIX = '--child_id='

window['myApp'] = {
  onWindowClose: () => {
    Neutralino.app.exit()
  },
  callScript: (keys: string) => {
    console.info('[cmd:run]', `${(window as any).NL_CWD}/cmd/nircmd.exe ${keys}`)
    Neutralino.debug.log(`${(window as any).NL_CWD}/cmd/nircmd.exe ${keys}`)
    Neutralino.os.execCommand(
      `${(window as any).NL_CWD}/cmd/nircmd.exe ${keys}`,
      (d) => {
        console.info('d', d)
      },
      () => {
        console.error('error')
        Neutralino.debug.log(`ERROR: ${(window as any).NL_CWD}/cmd/nircmd.exe ${keys}`, 'ERROR')
      }
    )
  },
  setTitle: (channel: string, isActive: boolean) => {
    Neutralino.window.setTitle(['Twitch Plays', channel, isActive ? '[Connected]' : ''].filter(Boolean).join(' - '))
  },
  createNewInstance: async (existingInstanceId?: number) => {
    const ourInstanceId = getInstance()
    const instanceId = existingInstanceId ?? ourInstanceId + 1
    await Neutralino.window.create('/resources/index.html', {
      exitProcessOnClose: true,
      processArgs: `${CHILD_FLAG_PREFIX}${instanceId}`,
    })
    try {
      const instances = JSON.parse(Neutralino.storage.getData('instances')) || []
      Neutralino.storage.setData('instances', JSON.stringify(instances.concat([instanceId])))
    } catch {
      Neutralino.storage.setData('instances', JSON.stringify([instanceId]))
    }
  },
}

// Initialize native API communication. This is non-blocking
// use 'ready' event to run code on app load.
// Avoid calling API functions before init or after init.
Neutralino.init()

Neutralino.events.on('windowClose', window['myApp'].onWindowClose)

Neutralino.events.on('ready', () => {
  setInstance(Number(NL_ARGS.find((a) => a.startsWith(CHILD_FLAG_PREFIX))?.replace(CHILD_FLAG_PREFIX, '')))
  const ourInstanceId = getInstance()
  const isChild = ourInstanceId !== 1
  if (!isChild) {
    try {
      const instances = JSON.parse(Neutralino.storage.getData('instances'))
      if (instances) {
        instances.forEach((i) => {
          if (i !== ourInstanceId) {
            window['myApp'].createNewInstance(i)
          }
        })
      }
      Neutralino.storage.setData('instances', JSON.stringify(instances || [ourInstanceId]))
    } catch (e) {
      Neutralino.storage.setData('instances', JSON.stringify([ourInstanceId]))
    }
  }
  ReactDom.render(<App />, document.querySelector('#app'))
})
