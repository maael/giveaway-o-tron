/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
import Countdown, { zeroPad } from 'react-countdown'
import { getRelayURI } from './util'

const SPECIAL_COMMAND_TEXT = {
  $gw2_account$: 'your Guild Wars 2 account name XXXX.1234',
  $steam_friend$: 'your 8 digit Steam friend code',
  $gw2_or_steam$: 'either your GW2 account name or Steam friend code',
  $gw2_or_steam_or_paypal$: 'either your GW2 account name or Steam friend code or the word paypal',
}

const countDownRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a complete state
    return <div className="animate-pulse cagfont">Giveaway closed!</div>
  } else {
    // Render a countdown
    return (
      <span>
        {zeroPad(hours, 2)} : {zeroPad(minutes, 2)} : {zeroPad(seconds, 2)}
      </span>
    )
  }
}

const StableCountdown = React.memo(function StableCountdown({ value }: { value: number }) {
  return <Countdown renderer={countDownRenderer} date={value} />
})

export default function GW2Alerts() {
  const router = useRouter()
  const channel = router.query.channel
  const relayVersion = router.query.rv

  const [status, setStatus] = React.useState<{
    status?: string
    command?: string
    goalTs?: number
    followersOnly?: boolean
    theme?: string
    imageUrl?: string
    hidden?: boolean
  }>({})

  const handleEvent = React.useCallback(
    (e: {
      channelId: number
      alertDuration: number
      alertTheme: string
      type?: string
      chatCommand?: string
      ts?: number
      duration?: number
      followersOnly?: string
      alertCustomImageUrl?: string
      hidden?: boolean
    }) => {
      console.info('[event]', e)
      if (`${e.channelId}` !== `${channel}`) return
      if (e.type === 'timer-start') {
        setStatus({
          status: 'start',
          command: e.chatCommand ? e.chatCommand.trim() : e.chatCommand,
          goalTs: e.ts && e.duration ? Number(new Date(e.ts)) + e.duration : undefined,
          followersOnly: !!e.followersOnly,
          theme: e.alertTheme,
          imageUrl: e.alertCustomImageUrl,
        })
      } else if (e.type === 'timer-end') {
        setStatus({
          status: 'ended',
          followersOnly: !!e.followersOnly,
          theme: e.alertTheme,
          imageUrl: e.alertCustomImageUrl,
        })
      } else if (e.type === 'timer-hide') {
        setStatus((s) => ({ ...s, hidden: e.hidden }))
      } else if (e.type === 'timer-cancel') {
        setStatus({})
      }
    },
    [channel]
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
          console.warn('[giveaway-status][error]', e)
        }
      }
    }
  }, [handleEvent, relayVersion, channel])
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
          ? `Message with "${status.command
              .split(' ')
              .map((c) => SPECIAL_COMMAND_TEXT[c] || c)
              .join(' ')}" for a chance to win!`
          : "Make sure to send a message in chat, there's no command!"
        : status.status === 'ended'
        ? 'Good luck!'
        : null,
    status: status.status,
    command: status.command,
    followersOnly: status.followersOnly,
    imageUrl: status.imageUrl,
    goalTs: status.goalTs,
  }
  console.info('[props]', props)
  React.useEffect(() => {
    new Image().src = '/images/chest-notification.png'
  }, [])
  return status.status && !status.hidden ? (
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
  goalTs?: number
}

function Gw2Status({ status, title, goalTs, body, command, followersOnly }: StatusProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        status ? (status === 'start' ? 'animate-slowwiggle' : '') : 'animate-out fade-out'
      }`}
    >
      <img src="/images/chest-notification.png" />
      <div
        className={`text-white uppercasetext-bold left-2 right-2 text-center absolute uppercase gwfont ${
          goalTs ? 'text-2xl' : followersOnly ? 'text-2xl' : 'text-3xl'
        }`}
        style={{ top: goalTs ? 225 : 235 }}
      >
        {title}
      </div>
      {goalTs ? (
        <div
          className={`text-white uppercasetext-bold left-2 right-2 text-center absolute uppercase cagfont ${
            followersOnly ? 'text-xl' : 'text-xl'
          }`}
          style={{ top: 252 }}
        >
          <StableCountdown value={Number(goalTs)} />
        </div>
      ) : null}
      <div
        className={`text-white uppercase px-4 py-2 text-bold text-center absolute cagfont ${
          command && Object.keys(SPECIAL_COMMAND_TEXT).some((k) => command.includes(k)) ? 'text-lg' : 'text-2xl'
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
