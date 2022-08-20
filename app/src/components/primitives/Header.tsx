import React, { Dispatch, SetStateAction } from 'react'
import {
  FaRobot as LogoIco,
  FaTwitch as TwitchIco,
  FaAngleLeft as LeftIco,
  FaCogs,
  FaMagic,
  FaCheck,
} from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChannelInfo } from '~/utils'
import chat from '../../chat'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

export default function Header({
  client,
  resetChat,
  setClient,
  channelInfo,
}: {
  client: ReturnType<typeof chat> | null
  resetChat: () => void
  setClient: Dispatch<SetStateAction<ReturnType<typeof chat> | null>>
  channelInfo: ChannelInfo
}) {
  const location = useLocation()
  const homeRoute = channelInfo.login ? '/' : '/setup'
  const [copiedAlertURL, copyAlertURL] = useCopyToClipboard(
    `https://giveaway-o-tron.vercel.app/alerts/gw2?channel=${channelInfo.userId}`
  )
  return (
    <div className="flex flex-row justify-start gap-2">
      <div className="flex-1 flex flex-row gap-2 items-center">
        <div className="inline-block">
          <Link to={homeRoute}>
            <h1 className="flex flex-row gap-1 items-center text-white bg-purple-600 rounded-md px-3 py-1 transform hover:scale-105 transition-transform shadow-md">
              <LogoIco className="text-2xl" />{' '}
              {location.pathname === homeRoute ? (
                <span className="relative -top-0.5 ml-1">Giveaway-o-tron</span>
              ) : (
                <LeftIco className="text-xl" />
              )}
            </h1>
          </Link>
        </div>
        {location.pathname === '/setup' ? null : (
          <Link to="/settings">
            <div className="bg-purple-600 p-2 flex justify-center items-center rounded-md">
              <FaCogs />
            </div>
          </Link>
        )}
        {location.pathname === '/setup' ? null : (
          <button
            title="Get url for OBS browser source based alerts animation"
            className="bg-purple-600 p-2 flex justify-center items-center rounded-md"
            onClick={() => {
              copyAlertURL()
              toast.success('Copied! Use as OBS browser source!', { position: 'bottom-center' })
            }}
          >
            {copiedAlertURL ? <FaCheck /> : <FaMagic />}
          </button>
        )}
      </div>
      <form
        className="flex flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (client) {
            client.disconnect()
            resetChat()
            setClient(null)
          } else {
            setClient(chat(channelInfo))
          }
        }}
      >
        <input
          className="bg-gray-700 px-2 py-1 rounded-l-md border-b border-l border-purple-500"
          placeholder="Channel Name"
          value={channelInfo.login}
          disabled
          title={!!client ? 'Disconnect to change' : 'Set channel to connect to'}
        />
        <button
          className="bg-purple-600 text-white py-1 px-3 rounded-r-sm transform hover:scale-105 transition-transform shadow-md flex flex-row items-center gap-2 w-32 justify-center"
          title="Connect to chat"
        >
          <TwitchIco /> {client ? 'Disconnect' : 'Connect'}
        </button>
      </form>
    </div>
  )
}
