/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
import { getRelayURI } from '../util'
import { GW2Status, CustomStatus } from './style'
import { SPECIAL_COMMAND_TEXT } from './style/shared'

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
  const isSpecialCommand = status.command?.split(' ').some((c) => !!SPECIAL_COMMAND_TEXT[c])
  const msgQuote = isSpecialCommand ? `` : `"`
  const props = {
    title:
      status.status === 'start'
        ? `${status.followersOnly ? 'Followers g' : 'G'}iveaway open`
        : status.status === 'ended'
        ? 'Good luck!'
        : null,
    body:
      status.status === 'start'
        ? status.command
          ? `Message with ${msgQuote}${status.command
              .split(' ')
              .map((c) => SPECIAL_COMMAND_TEXT[c] || c)
              .join(' ')}${msgQuote} for a chance to win!`
          : "Make sure to send a message in chat, there's no command!"
        : status.status === 'ended'
        ? 'The giveaway is closed'
        : null,
    status: status.status,
    command: status.command,
    followersOnly: status.followersOnly,
    imageUrl: status.imageUrl,
    goalTs: status.goalTs,
  }
  console.info('[props]', props)
  React.useEffect(() => {
    new Image().src = '/images/gw2/notification.png'
    new Image().src = '/images/gw2-aurene/notification.png'
    new Image().src = '/images/gw2-soto/notification.png'
    new Image().src = '/images/gw2-janthir/notification.png'
    new Image().src = '/images/mukluk/notification.png'
    new Image().src = '/images/guildmm/notification.png'
  }, [])
  return status.status && !status.hidden ? (
    <div className="w-full h-full">
      {status.theme === 'custom' ? <CustomStatus {...props} /> : <GW2Status {...props} alertType={status.theme} />}
    </div>
  ) : null
}
