import { useCallback, useEffect, useState } from 'react'
import tmi from 'tmi.js'
import toast from 'react-hot-toast'
import { ChannelInfo } from './utils'
import { WinnerUser } from './components/primitives/giveaways'
import { format } from 'date-fns'

export interface ChatItem {
  id: string
  color: string
  displayName: string
  isSubscriber: boolean
  turbo: boolean
  username: string
  type: string
  msg: string
  returningChatter: boolean
  firstMessage: boolean
  isMod: boolean
  userId: string
  tmiTs: number
  receivedTs: number
  formattedTmiTs: string
}

export type Chat = ReturnType<typeof init> | null

export class ChatEvent extends EventTarget {
  emit(data: ChatItem) {
    this.dispatchEvent(new CustomEvent('chat', { detail: data }))
  }
}

export const chatEmitter = new ChatEvent()

export function useChatEvents(
  paused: boolean,
  winners: WinnerUser[],
  onChat: (chat: ChatItem) => void
): [ChatItem[], () => void] {
  const [chat, setChat] = useState<ChatItem[]>([])
  useEffect(() => {
    function handleChat(d: CustomEvent<ChatItem>) {
      onChat(d.detail)
      if (paused && !winners.some((w) => w.username === d.detail.username)) return
      setChat((c) => c.concat(d.detail))
    }
    chatEmitter.addEventListener('chat', handleChat)
    return () => {
      chatEmitter.removeEventListener('chat', handleChat)
    }
  }, [setChat, onChat, paused, winners])
  const resetChat = useCallback(() => {
    setChat([])
  }, [setChat])
  return [chat, resetChat]
}

export default function init(channelInfo: ChannelInfo) {
  // Define configuration options
  const opts: tmi.Options = {
    channels: [channelInfo.login!],
    identity: {
      username: channelInfo.login,
      password: `oauth:${channelInfo.token}`,
    },
    options: {
      updateEmotesetsTimer: 0,
      skipUpdatingEmotesets: true,
    },
  }

  // Create a client with our options
  const client = new tmi.client(opts)

  if ((client as any).lastJoined && client.readyState() === 'OPEN') {
    try {
      client.disconnect()
    } catch (e) {
      console.warn('[chat-disconnect]', e)
    }
  }

  // Called every time a message comes in
  function onMessageHandler(target, context, msg, self) {
    if (self) {
      return
    } // Ignore messages from the bot

    const tmiTs = Number(context['tmi-sent-ts'])
    const data: ChatItem = {
      id: context.id,
      color: context.color,
      displayName: context['display-name'],
      isSubscriber: context.subscriber,
      turbo: context.turbo,
      username: context.username,
      type: context['message-type'],
      msg,
      returningChatter: context['returning-chatter'],
      firstMessage: context['first-msg'],
      isMod: context['mod'],
      userId: context['user-id'],
      tmiTs,
      receivedTs: Date.now(),
      formattedTmiTs: format(new Date(tmiTs), 'HH:mm:ss'),
    }

    chatEmitter.emit(data)
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler(addr, port) {
    try {
      toast.success('Connected to chat!', {
        position: 'bottom-center',
        style: { fontSize: '0.9rem', padding: '0.2rem' },
      })
    } catch (e) {
      console.error('[error]', e)
    }
    console.log(`* Connected to ${addr}:${port}`)
  }

  // Register our event handlers (defined below)
  client.on('message', onMessageHandler)
  client.on('connected', onConnectedHandler)
  client.on('timeout', () => {
    console.info('[timeout]')
  })

  // Connect to Twitch:
  client.connect()
  return client
}
