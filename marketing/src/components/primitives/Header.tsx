import React, { Dispatch, SetStateAction } from 'react'
import {
  FaRobot as LogoIco,
  FaTwitch as TwitchIco,
  FaAngleLeft as LeftIco,
  FaCogs,
  FaClock,
  FaQuestion,
  FaDiscord,
  FaYoutube,
} from 'react-icons/fa'
import { SiObsstudio } from 'react-icons/si'
import { Link, useLocation } from 'react-router-dom'
import cls from 'classnames'
import { ChannelInfo } from '~/utils'
import chat from '../../chat'
import useSession from '../hooks/useSession'
import { useBeta } from '../hooks/useBeta'

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
  const session = useSession()
  const location = useLocation()
  const inBeta = useBeta()
  const homeRoute = channelInfo.login ? '/' : '/setup'
  return (
    <div className="flex flex-row justify-start gap-2">
      <div className="flex-1 flex flex-row gap-2 items-center">
        <div className="inline-block">
          <Link to={homeRoute}>
            <h1 className="flex flex-row gap-1 items-center text-white bg-purple-600 rounded-md px-3 py-1 transform hover:scale-105 transition-transform shadow-md">
              <LogoIco className="text-2xl" />{' '}
              <span className="hidden sm:block">
                {location.pathname === homeRoute ? (
                  <span className="relative -top-0.5 ml-1">Giveaway-o-tron</span>
                ) : (
                  <LeftIco className="text-xl" />
                )}
              </span>
            </h1>
          </Link>
        </div>
        {location.pathname === '/setup' ? null : (
          <Link to="/settings">
            <div
              className="bg-purple-600 p-2 flex justify-center items-center rounded-md"
              title="Settings (blocklist etc)"
            >
              <FaCogs />
            </div>
          </Link>
        )}
        {location.pathname === '/setup' ? null : (
          <Link to="/discord">
            <div className="bg-purple-600 p-2 flex justify-center items-center rounded-md" title="Discord integration">
              <FaDiscord />
            </div>
          </Link>
        )}
        {location.pathname === '/setup' ? null : (
          <Link to="/giveaways">
            <div className="bg-purple-600 p-2 flex justify-center items-center rounded-md" title="Past giveways">
              <FaClock />
            </div>
          </Link>
        )}
        {location.pathname === '/setup' ? null : (
          <Link to="/obs">
            <div className="bg-purple-600 p-2 flex justify-center items-center rounded-md" title="Past giveways">
              <SiObsstudio />
            </div>
          </Link>
        )}
        {location.pathname === '/setup' ? null : (
          <button
            title="Open FAQ"
            className="bg-purple-600 p-2 flex justify-center items-center rounded-md"
            onClick={() => {
              window.open('https://giveaway-o-tron.mael.tech/guide#faq', '_blank')
            }}
          >
            <FaQuestion />
          </button>
        )}
      </div>
      {inBeta ? (
        <a
          href={session.data?.youtube ? '/api/auth/logout' : '/api/auth/google'}
          className={cls(
            'flex flex-row gap-1 rounded-md bg-red-600 justify-center items-center px-2 cursor-pointer hover:opacity-100',
            {
              'opacity-50': !session.data?.youtube?.username,
            }
          )}
        >
          <FaYoutube className="text-2xl" />
          <span className="relative -top-0.5">
            {session.data?.youtube?.username ? `${session.data?.youtube?.username.slice(0, 1)}...` : 'YouTube'}
          </span>
        </a>
      ) : null}
      <a
        href={session.data?.twitch ? '/api/auth/logout' : '/api/auth/twitch'}
        className={cls(
          'flex flex-row gap-1 rounded-md bg-purple-600 justify-center items-center px-2 cursor-pointer hover:opacity-100',
          {
            'opacity-50': !session.data?.twitch?.username,
          }
        )}
      >
        <TwitchIco className="text-sm" />
        <span className="relative -top-0.5">{session.data?.twitch?.username}</span>
      </a>
    </div>
  )
}
