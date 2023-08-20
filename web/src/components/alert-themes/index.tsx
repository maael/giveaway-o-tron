/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
import toast, { Toaster } from 'react-hot-toast'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { getRelayURI } from '../util'
import { CustomAlert, Gw2Alert } from './style'

const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
} as const

export default function GW2Alerts() {
  const router = useRouter()
  const channel = router.query.channel
  const relayVersion = router.query.rv
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refAnimationInstance = React.useRef<any>(null)

  const getInstance = React.useCallback((instance) => {
    refAnimationInstance.current = instance
  }, [])

  const makeShot = React.useCallback((particleRatio, opts) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(100 * particleRatio),
        colors: ['#FFE476', '#E0A702', '#D7A008'],
      })
  }, [])

  const fire = React.useCallback(() => {
    makeShot(0.8, {
      spread: 80,
      decay: 0.9,
      scalar: 0.8,
      startVelocity: 45,
      gravity: 0.8,
    })
  }, [makeShot])
  const handleEvent = React.useCallback(
    (e: {
      winner: string
      channelId: number
      alertDuration: number
      alertTheme: string
      type?: string
      alertCustomImageUrl?: string
    }) => {
      console.info('[event]', e)
      if (!channel || !e.channelId || (e.channelId || '').toString() !== (channel?.toString() || '')) return
      if (!e.type || e.type === 'winner') {
        toast.remove()
        if (e.alertTheme !== 'custom') fire()
        toast.custom(
          (t) => {
            return e.alertTheme === 'custom' ? (
              <CustomAlert winner={e.winner} imageUrl={e.alertCustomImageUrl} visible={t.visible} />
            ) : (
              <Gw2Alert winner={e.winner} visible={t.visible} type={e.alertTheme} />
            )
          },
          { duration: e.alertDuration || 4000 }
        )
      }
    },
    [fire, channel]
  )
  React.useEffect(() => {
    if (!channel) return
    const socket = io(getRelayURI(relayVersion), {
      query: { channel },
      transports: ['websocket', 'polling'],
    })

    socket.connect()

    socket.on('connect', () => {
      console.log('[id]', socket.id)
    })

    socket.on('connect_error', () => {
      console.log('[connect_error]', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('[disconnect]', socket.id)
    })

    socket.on('event', handleEvent)

    return () => {
      console.info('[hook][disconnect]')
      if (socket.connected) {
        try {
          socket.disconnect()
        } catch (e) {
          console.warn('[gw2-alert][error]', e)
        }
      }
    }
  }, [handleEvent, relayVersion, channel])
  React.useEffect(() => {
    new Image().src = '/images/gw2/notification.png'
    new Image().src = '/images/gw2-aurene/notification.png'
    new Image().src = '/images/gw2-soto/notification.png'
    new Image().src = '/images/mukluk/notification.png'
    new Image().src = '/images/guildmm/notification.png'
  }, [])
  return (
    <div className="w-full h-full">
      <Toaster />
      <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
    </div>
  )
}
