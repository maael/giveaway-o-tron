/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
import toast, { Toaster } from 'react-hot-toast'
import ReactCanvasConfetti from 'react-canvas-confetti'

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
    makeShot(0.5, {
      spread: 120,
      decay: 0.85,
      scalar: 0.8,
      startVelocity: 55,
      gravity: 0.5,
    })
  }, [makeShot])
  const handleEvent = React.useCallback(
    (e: { winner: string }) => {
      toast.remove()
      toast.custom((t) => {
        if (t.visible) fire()
        return (
          <div className="flex flex-col justify-center items-center bg-transparent animate-wiggle relative">
            <img src="/images/chest-notification.png" />
            <div
              className="text-white text-4xl uppercasetext-bold left-0 right-0 text-center absolute"
              style={{ top: 230 }}
            >
              Giveaway chest!
            </div>
            <div
              className="text-white text-3xl uppercase px-4 py-2 text-bold text-center absolute break-all"
              style={{ top: 300, left: 50, right: 50 }}
            >
              {e.winner} won!
            </div>
          </div>
        )
      })
    },
    [fire]
  )
  React.useEffect(() => {
    const socket = io(`wss://giveaway-o-tron-relay.onrender.com`)

    socket.connect()

    socket.on('connect', () => {
      console.log('[id]', socket.id) // "G5p5..."
      socket.on('event', handleEvent)
    })

    return () => {
      socket.disconnect()
    }
  }, [handleEvent, channel])
  return (
    <div className="w-full h-full">
      <Toaster />
      <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
    </div>
  )
}
