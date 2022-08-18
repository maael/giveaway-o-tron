import React from 'react'
import ReactDom from 'react-dom'
import App from './App'

window['myApp'] = {
  onWindowClose: () => {
    Neutralino.app.exit()
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

Neutralino.events.on('ready', () => {
  ReactDom.render(<App />, document.querySelector('#app'))
})
