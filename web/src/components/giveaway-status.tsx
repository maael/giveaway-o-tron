/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'

export default function GW2Alerts() {
  const router = useRouter()
  const channel = router.query.channel

  const [status, setStatus] = React.useState<{
    status?: string
    command?: string
    ts?: string
    followersOnly?: boolean
    theme?: string
    imageUrl?: string
  }>({})

  const handleEvent = React.useCallback(
    (e: {
      channelId: number
      alertDuration: number
      alertTheme: string
      type?: string
      chatCommand?: string
      ts?: string
      followersOnly?: string
      alertCustomImageUrl?: string
    }) => {
      console.info('[event]', e)
      if (`${e.channelId}` !== `${channel}`) return
      if (e.type === 'timer-start') {
        setStatus({
          status: 'start',
          command: e.chatCommand,
          ts: e.ts,
          followersOnly: !!e.followersOnly,
          theme: e.alertTheme,
          imageUrl: e.alertCustomImageUrl,
        })
      } else if (e.type === 'timer-end') {
        setStatus({
          status: 'ended',
          ts: e.ts,
          followersOnly: !!e.followersOnly,
          theme: e.alertTheme,
          imageUrl: e.alertCustomImageUrl,
        })
      } else if (e.type === 'timer-cancel') {
        setStatus({})
      }
    },
    [channel]
  )
  React.useEffect(() => {
    const socket = io(`wss://giveaway-o-tron-relay.onrender.com`, { query: { channel } })

    socket.connect()

    socket.on('connect', () => {
      console.log('[id]', socket.id) // "G5p5..."
      socket.on('event', handleEvent)
    })

    return () => {
      socket.disconnect()
    }
  }, [handleEvent, channel])
  console.info('[status]', status)
  const props = {
    title:
      status.status === 'start'
        ? `${status.followersOnly ? 'Followers g' : 'G'}iveaway open`
        : status.status === 'ended'
        ? 'The giveaway is closed'
        : null,
    body:
      status.status === 'start'
        ? status.command
          ? `Message ${
              status.command === '$gw2_account$'
                ? 'with your Guild Wars 2 account name XXXX.1234'
                : `including ${status.command}`
            } for a chance to win!`
          : "Make sure to send a message in chat, there's no command!"
        : status.status === 'ended'
        ? 'Good luck!'
        : null,
    status: status.status,
    command: status.command,
    followersOnly: status.followersOnly,
    imageUrl: status.imageUrl,
  }
  console.info('[props]', props)
  return status.status ? (
    <div className="w-full h-full">
      {status.theme === 'gw2' ? <Gw2Status {...props} /> : <CustomStatus {...props} />}
    </div>
  ) : null
}

interface StatusProps {
  title?: string | null
  body?: string | null
  status?: string
  command?: string
  followersOnly?: boolean
  imageUrl?: string
}

function Gw2Status({ status, title, body, command, followersOnly }: StatusProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        status ? (status === 'start' ? 'animate-slowwiggle' : '') : 'animate-out fade-out'
      }`}
    >
      <img src="/images/chest-notification.png" />
      <div
        className={`text-white uppercasetext-bold left-2 right-2 text-center absolute uppercase ${
          followersOnly ? 'text-2xl' : 'text-3xl'
        }`}
        style={{ top: 235 }}
      >
        {title}
      </div>
      <div
        className={`text-white uppercase px-4 py-2 text-bold text-center absolute ${
          command !== '$gw2_account$' ? 'text-2xl' : 'text-xl'
        }`}
        style={{ top: 284, width: 360 }}
      >
        {body}
      </div>
    </div>
  )
}

function CustomStatus({ status, title, body, imageUrl }: StatusProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both text-white font-bold text-center ${
        status ? (status === 'start' ? 'animate-in fade-in' : '') : 'animate-out fade-out'
      }`}
    >
      {imageUrl ? <img src={imageUrl} className="h-72" /> : null}
      <div className="text-5xl my-3">{title}</div>
      <div className="text-4xl">{body}</div>
    </div>
  )
}
