import { useCallback, useState } from 'react'
import format from 'date-fns/format'
import stringToColour from 'string-to-color'
import useSession from './useSession'
import { ChatItem } from '~/chat'
import { safeYoutubeFetch } from '~/utils/google'
import { useRecursiveTimeout } from './useRecursiveTimeout'
import toast from 'react-hot-toast'

interface YoutubeStream {
  id?: string
  channelId?: string
  title?: string
  chatId?: string
}

async function getAndSetYoutubeChat(accessToken: string, chatId: string) {
  try {
    if (!chatId) {
      console.error('[youtube] No chat ID')
      return { delay: null }
    }
    console.info('[youtube] Getting chat')
    const nextPageToken = localStorage.getItem(`youtube-chat/${chatId}`) || undefined
    const data = await safeYoutubeFetch(
      `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&maxResults=2000&part=snippet,authorDetails${
        nextPageToken ? `&pageToken=${nextPageToken}` : ''
      }`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    ).then((r) => r.json())
    if (data?.items) {
      const chatItems: ChatItem[] = data?.items
        .filter((i) => i.snippet.type === 'textMessageEvent')
        .map((i) => ({
          id: i.id,
          color: stringToColour(i.authorDetails.displayName),
          displayName: i.authorDetails.displayName,
          isSubscriber: false,
          turbo: false,
          username: i.authorDetails.displayName,
          type: i.snippet.type,
          msg: i.snippet.displayMessage,
          returningChatter: false,
          firstMessage: false,
          isMod: i.authorDetails.isChatModerator,
          userId: i.authorDetails.channelId,
          tmiTs: +new Date(i.snippet.publishedAt),
          receivedTs: Date.now(),
          formattedTmiTs: format(new Date(i.snippet.publishedAt), 'HH:mm:ss'),
          source: 'youtube',
        }))
      localStorage.setItem(`youtube-chat/${chatId}`, data.nextPageToken || nextPageToken)
      return {
        chatItems,
        nextPageToken: data.nextPageToken || nextPageToken,
        delay: Math.max(data.pollingIntervalMillis || 60_000, 15_000),
      }
    }
    console.error('[youtube][chat][missing]', 'No items')
    return { delay: null }
  } catch (e) {
    console.error('[youtube][chat][error]', e)
    return { delay: null }
  }
}

async function getFirstBroadcast(token?: string) {
  if (token) {
    console.info('[youtube] Start')
    const data = await safeYoutubeFetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?mine=true', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json())
    const streamInfoRaw = (data.items || [])[0]
    const streamInfo = {
      id: streamInfoRaw?.id,
      channelId: streamInfoRaw?.snippet.channelId,
      title: streamInfoRaw?.snippet.title,
      chatId: streamInfoRaw?.snippet.liveChatId,
    }
    console.info('[youtube] Data', streamInfo)
    return streamInfo
  }
}

function updateChat(chatItems: ChatItem[]) {
  return (c: ChatItem[]) => {
    const chatIds = new Set(c.map((c) => c.id))
    const newItems = chatItems.filter((i) => !chatIds.has(i.id))
    return c.concat(newItems).sort((a, b) => a.tmiTs - b.tmiTs)
  }
}

export function useYoutubeChat(setChat: React.Dispatch<React.SetStateAction<ChatItem[]>>) {
  const session = useSession()
  const [youtubeStream, setYoutubeStream] = useState<YoutubeStream>()

  const [broadcastDelay, setBroadcastDelay] = useState<null | number>(1_000)
  const [chatDelay, setChatDelay] = useState<null | number>(null)

  useRecursiveTimeout(
    '[youtube][broadcast]',
    async () => {
      const streamInfo = await getFirstBroadcast(session.data?.youtube?.accessToken)
      setYoutubeStream(streamInfo)
      if (streamInfo && streamInfo.chatId) {
        console.info('[youtube][broadcast]', 'Got broadcast', streamInfo)
        setBroadcastDelay(null)
      } else {
        console.info('[youtube][broadcast]', 'No broadcast')
        setBroadcastDelay(60_000)
      }
    },
    broadcastDelay
  )

  useRecursiveTimeout(
    '[youtube][chat]',
    async () => {
      if (youtubeStream?.chatId && session?.data?.youtube?.accessToken) {
        console.info('[youtube][chat]', 'Start', chatDelay)
        const { chatItems, delay } = await getAndSetYoutubeChat(
          session?.data?.youtube?.accessToken,
          youtubeStream?.chatId
        )
        const nextDelay = delay ? Math.max(chatDelay || 15_000, delay) : null
        console.info('[youtube][chat]', 'Got items', { length: chatItems?.length, nextDelay })
        if (chatItems) {
          setChat(updateChat(chatItems))
        }
        setChatDelay(nextDelay)
      }
    },
    chatDelay
  )

  const getYoutubeChat = useCallback(async () => {
    try {
      if (youtubeStream?.chatId && session?.data?.youtube?.accessToken) {
        const { chatItems } = await getAndSetYoutubeChat(session?.data?.youtube?.accessToken, youtubeStream?.chatId)
        if (chatItems) {
          setChat(updateChat(chatItems))
          toast.success(`Got ${chatItems.length} new YouTube messages`, {
            position: 'bottom-center',
          })
        } else {
          toast.success('No YouTube messages found', {
            position: 'bottom-center',
          })
        }
      }
    } catch (e) {
      console.info('[youtube][chat][error]', e)
    }
  }, [session?.data?.youtube?.accessToken, youtubeStream, setChat])

  return {
    getChat: getYoutubeChat,
    setChatPoll: setChatDelay,
    chatDelay,
  }
}
