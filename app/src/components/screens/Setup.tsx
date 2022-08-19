import React, { Dispatch, SetStateAction } from 'react'
import { useHistory } from 'react-router-dom'
import { FaTwitch as TwitchIco } from 'react-icons/fa'
import { ChannelInfo } from '../../utils'
import chat from '../../chat'

async function validateToken(token: string, refreshToken: string) {
  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    })
    if (res.status === 401) {
      return refreshTokenFlow(refreshToken)
    }
    const data = (await res.json()) as any
    console.info('[validate]', data)
    return {
      token,
      refreshToken,
      clientId: data.client_id,
      login: data.login === 'odialo' ? 'mukluk' : data.login,
      userId: data.user_id,
    }
  } catch {
    return null
  }
}

export async function refreshTokenFlow(refreshToken: string) {
  const channelInfo = await JSON.parse(await Neutralino.storage.getData('main-channelinfo'))
  const details = {
    client_id: channelInfo.clientId,
    client_secret: 'Password!', // TODO: Figure out how to do this
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }

  const formBody: string[] = []
  for (let property in details) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(details[property])
    formBody.push(`${encodedKey}=${encodedValue}`)
  }
  const body = formBody.join('&')
  const res = await fetch(`https://id.twitch.tv/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body,
  })
  if (res.status === 403) {
    console.error('[refresh][error]')
    throw Error('Refresh token failed')
  }
  const data = (await res.json()) as {
    access_token: string
    refresh_token: string
  }
  await Neutralino.storage.setData(
    'main-channelinfo',
    JSON.stringify({ ...channelInfo, accessToken: data.access_token, refreshToken: data.refresh_token })
  )
  return {
    token: data.access_token,
    clientId: channelInfo.clientId,
    login: channelInfo.login,
    userId: channelInfo.userId,
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
    <div className="flex flex-col justify-center items-center h-full gap-3 -mt-10">
      <div className="text-2xl">Setup</div>
      <button onClick={() => Neutralino.os.open('https://giveaway-o-tron.vercel.app')}>
        Click here to authenticate with Twitch and get the required tokens →
      </button>
      <form
        className="flex flex-col gap-2 justify-center items-center"
        onSubmit={async (e) => {
          e.preventDefault()
          const accessToken = (e.currentTarget.elements as any).accessToken.value.trim()
          const refreshToken = (e.currentTarget.elements as any).refreshToken.value.trim()
          const data = await validateToken(accessToken, refreshToken)
          if (!data) return
          resetChat()
          if (data.login) setClient(chat(data))
          setChannel(data)
          history.push('/')
        }}
      >
        <input
          className="bg-gray-700 px-2 py-1 rounded-md border-b border-purple-500 overflow-ellipsis"
          placeholder="Access Token..."
          name="accessToken"
          type="password"
        />
        <input
          className="bg-gray-700 px-2 py-1 rounded-md border-b border-purple-500 overflow-ellipsis"
          placeholder="Refresh Token..."
          name="refreshToken"
          type="password"
        />
        <button
          className="bg-purple-600 text-white py-1 px-3 rounded-md transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 w-32 justify-center"
          title="Setup connection"
        >
          <TwitchIco /> Setup
        </button>
      </form>
    </div>
  )
}
