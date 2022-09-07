/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
// import { AutoTextSize } from 'auto-text-size'

export default function GiveawayEntries() {
  const router = useRouter()
  const channel = router.query.channel

  const handleEvent = React.useCallback(
    (e: { username: string; displayName: string; color: string; channelId: string; login: string; type: string }) => {
      console.info('[event]', e)
      if (!channel || !e.channelId || (e.channelId || '').toString() !== (channel?.toString() || '')) return
      if (e.type === 'entry') {
        console.info('[entry]', e)
      }
    },
    [channel]
  )
  React.useEffect(() => {
    const socket = io(`wss://giveaway-o-tron-relay.onrender.com`, { query: { channel } })

    socket.connect()

    socket.on('connect', () => {
      console.log('[id]', socket.id)
      socket.on('event', handleEvent)
    })

    return () => {
      socket.disconnect()
    }
  }, [handleEvent, channel])
  return <div className="w-full h-full"></div>
}
