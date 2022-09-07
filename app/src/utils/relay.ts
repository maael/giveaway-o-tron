import { io } from 'socket.io-client'

const socket = io('wss://giveaway-o-tron-relay.onrender.com', {
  transports: ['websocket', 'polling'],
})

socket.on('connect', function () {
  console.info('[relay][connect]')
})

socket.on('connect_error', function (e) {
  console.info('[relay][connect_error]', e)
})

socket.on('disconnect', function (e) {
  console.info('[relay][disconnect]', e)
})

export default socket
