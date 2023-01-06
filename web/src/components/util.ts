export function getRelayURI(version?: string | string[]) {
  if (!version) {
    return 'wss://giveaway-o-tron-relay.onrender.com'
  } else if (version.toString() === '2') {
    return 'wss://mael-relay.onrender.com/giveaway-o-tron'
  } else if (version.toString() === 'local') {
    return 'ws://localhost:3003/giveaway-o-tron'
  } else {
    return 'wss://mael-relay.onrender.com/giveaway-o-tron'
  }
}
