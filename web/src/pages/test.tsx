import * as React from 'react'
import { io } from 'socket.io-client'

const socket = io('wss://giveaway-o-tron-relay.onrender.com', {
  reconnectionDelayMax: 10000,
})

socket.connect()

socket.on('connect', () => {
  console.log('[id]', socket.id) // "G5p5..."
})

export default function Test() {
  return <div>Test</div>
}
