import React, { Dispatch, SetStateAction } from 'react'
import { useHistory } from 'react-router-dom'
import { FaTwitch as TwitchIco } from 'react-icons/fa'
import { ChannelInfo, validateToken } from '../../utils'
import chat from '../../chat'

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
    if (channel.login && !NL_ARGS.includes('--restarted')) {
      history.push('/')
    }
  }, [channel.login])
  return (
    <div className="flex flex-col justify-center items-center h-full gap-3 -mt-10">
      <div className="text-3xl">First Time Setup</div>
      <p className="max-w-md text-center opacity-70">
        Click below to open a browser and log in with your Twitch account, to get the tokens needed below.
      </p>
      <button
        className="bg-purple-600 text-white py-1 px-3 rounded-md transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 justify-center"
        onClick={() => Neutralino.os.open('https://giveaway-o-tron.vercel.app')}
        title="Go to Twitch"
      >
        Authenticate with Twitch to get tokens →
      </button>
      <p className="max-w-lg text-center opacity-70 mt-4">Once you have the tokens, you can post them below.</p>
      <form
        className="flex flex-col gap-2 justify-center items-center"
        onSubmit={async (e) => {
          e.preventDefault()
          const accessToken = (e.currentTarget.elements as any).accessToken.value.trim()
          const refreshToken = (e.currentTarget.elements as any).refreshToken.value.trim()
          if (!accessToken || !refreshToken) return
          const data = await validateToken(accessToken, refreshToken)
          if (!data) return
          resetChat()
          console.info('[setup][client]', data)
          if (data.login) setClient((cl) => (cl ? cl : chat(data)))
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
          className="bg-purple-600 text-white py-1 px-5 rounded-md transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 justify-center text-xl mt-2"
          title="Setup connection"
        >
          <TwitchIco />
          <span className="relative -top-0.5">Finish Setup</span>
        </button>
      </form>
    </div>
  )
}
