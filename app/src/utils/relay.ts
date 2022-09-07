import { io } from 'socket.io-client'

const socket = io('wss://giveaway-o-tron-relay.onrender.com', {
  transports: ['websocket', 'polling'],
})

export default socket
