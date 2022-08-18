import React, { Dispatch, SetStateAction } from 'react'
import { useHistory } from 'react-router-dom'
import { FaTwitch as TwitchIco } from 'react-icons/fa'
import { ChannelInfo } from '../../utils'
import chat from '../../chat'

async function validateToken(token: string) {
  try {
    const data = await fetch(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    }).then((res) => res.json())
    return {
      token,
      clientId: data.client_id,
      login: data.login === 'odialo' ? 'mightyteapot' : data.login,
      userId: data.user_id,
    }
  } catch {
    return null
  }
}

export default function Setup({
  resetChat,
  setClient,
  channel,
  setChannel,
}: {
  resetChat: () => void
  setClient: Dispatch<SetStateAction<ReturnType<typeof chat> | null>>
  channel: ChannelInfo
  setChannel: Dispatch<SetStateAction<ChannelInfo>>
}) {
  const history = useHistory()
  React.useEffect(() => {
    if (channel.login) {
      history.push('/')
    }
  }, [channel.login])
  return (
    <div className="flex flex-col justify-center items-center h-full gap-2 -mt-10">
      <div>Setup</div>
      <button onClick={() => Neutralino.os.open('https://giveaway-o-tron.vercel.app')}>
        Click here to authenticate with Twitch and get the required tokens
      </button>
      <form
        className="flex flex-row"
        onSubmit={async (e) => {
          e.preventDefault()
          const accessToken = (e.currentTarget.elements as any).accessToken.value.trim()
          const data = await validateToken(accessToken)
          if (!data) return
          resetChat()
          if (data.login) setClient(chat(data))
          setChannel(data)
          history.push('/')
        }}
      >
        <input
          className="bg-gray-700 px-2 py-1 rounded-l-md border-b border-l border-purple-500 overflow-ellipsis"
          placeholder="Access Token"
          name="accessToken"
        />
        <button
          className="bg-purple-600 text-white py-1 px-3 rounded-r-md transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 w-32 justify-center"
          title="Setup connection"
        >
          <TwitchIco /> Setup
        </button>
      </form>
    </div>
  )
}
