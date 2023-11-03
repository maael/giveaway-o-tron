import { useEffect, useState } from 'react'
import format from 'date-fns/format'
import stringToColour from 'string-to-color'
import useSession from './useSession'
import { ChatItem } from '~/chat'
import { safeYoutubeFetch } from '~/utils/google'

interface YoutubeStream {
  id?: string
  channelId?: string
  title?: string
  chatId?: string
}

async function getAndSetYoutubeChat(
  accessToken: string,
  chatId: string,
  setChat: React.Dispatch<React.SetStateAction<ChatItem[]>>,
  nextPageToken?: string
) {
  console.info('[youtube] Getting chat')
  const data = await safeYoutubeFetch(
    `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&part=snippet,authorDetails${
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
    setChat((c) => {
      const chatIds = new Set(c.map((c) => c.id))
      const newItems = chatItems.filter((i) => !chatIds.has(i.id))
      if (nextPageToken) localStorage.setItem(`youtube-chat/${chatId}`, nextPageToken)
      return c.concat(newItems)
    })
  }
  setTimeout(
    () => getAndSetYoutubeChat(accessToken, chatId, setChat, data.nextPageToken || nextPageToken),
    Math.max(data.pollingIntervalMillis || 60_000, 15_000)
  )
}

export function useYoutubeChat(setChat: React.Dispatch<React.SetStateAction<ChatItem[]>>) {
  const session = useSession()
  const [youtubeStream, setYoutubeStream] = useState<YoutubeStream>()
  useEffect(() => {
    ;(async () => {
      if (session.data?.youtube?.accessToken) {
        console.info('[youtube] Start')
        const data = await safeYoutubeFetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?mine=true', {
          headers: { Authorization: `Bearer ${session.data?.youtube?.accessToken}` },
        }).then((r) => r.json())
        const streamInfoRaw = (data.items || [])[0]
        const streamInfo = {
          id: streamInfoRaw?.id,
          channelId: streamInfoRaw?.snippet.channelId,
          title: streamInfoRaw?.snippet.title,
          chatId: streamInfoRaw?.snippet.liveChatId,
        }
        console.info('[youtube] Data', streamInfo)
        setYoutubeStream(streamInfo)
      }
    })()
  }, [session?.data?.youtube?.accessToken])

  useEffect(() => {
    ;(async () => {
      if (youtubeStream?.chatId && session?.data?.youtube?.accessToken) {
        void getAndSetYoutubeChat(
          session?.data?.youtube?.accessToken,
          youtubeStream?.chatId,
          setChat,
          localStorage.getItem(`youtube-chat/${youtubeStream?.chatId}`) || undefined
        )
      }
    })()
  }, [session?.data?.youtube?.accessToken, youtubeStream, setChat])
}
