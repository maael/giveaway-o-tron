/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
import toast, { Toaster } from 'react-hot-toast'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { AutoTextSize } from 'auto-text-size'
import { getRelayURI } from '../util'

const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
} as const

function Gw2Alert({ winner, visible }: { winner: string; visible: boolean }) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        visible ? 'animate-wiggle' : 'animate-out fade-out'
      }`}
    >
      <img src="/images/chest-notification.png" />
      <div
        className="text-white text-4xl uppercasetext-bold left-0 right-0 text-center absolute gwfont"
        style={{ top: 230 }}
      >
        Giveaway chest!
      </div>
      <div>
        <div
          className="text-white uppercase px-4 py-2 text-bold text-center absolute mx-auto items-center-important cagfont"
          style={{ top: 292, left: 50, right: 50, width: 450, height: 50 }}
        >
          <AutoTextSize maxFontSizePx={50}>
            <p className="mx-auto my-auto">{winner}</p>
          </AutoTextSize>
        </div>
        <div
          className="text-white text-4xl uppercase px-4 py-2 text-bold text-center absolute mx-auto cagfont"
          style={{ top: 340, left: 50, right: 50, width: 450, height: 50 }}
        >
          won!
        </div>
      </div>
    </div>
  )
}

function CustomAlert({ winner, imageUrl, visible }: { imageUrl?: string; winner: string; visible: boolean }) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        visible ? 'animate-in fade-in' : 'animate-out fade-out'
      }`}
    >
      <img src={imageUrl} />
      <div className="text-4xl mt-5 uppercase text-white font-bold">{winner} won!</div>
    </div>
  )
}

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
              <Gw2Alert winner={e.winner} visible={t.visible} />
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
    new Image().src = '/images/chest-notification.png'
  }, [])
  return (
    <div className="w-full h-full">
      <Toaster />
      <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
    </div>
  )
}
