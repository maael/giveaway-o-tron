import React from 'react'
import {
  FaAngleDown,
  FaAngleUp,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaTwitch,
  FaYoutube,
} from 'react-icons/fa'
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts'
import format from 'date-fns/format'
import { CacheHistory, CacheStats } from '~/utils'
import cls from 'classnames'
import { useBeta } from '../hooks/useBeta'
import useSession from '../hooks/useSession'
import toast from 'react-hot-toast'
import { YOUTUBE_STORAGE_KEYS } from '~/utils/google'

const PLATFORM_THEME = {
  twitch: {
    border: 'border-purple-600',
    bg: 'bg-purple-600',
  },
  youtube: {
    border: 'border-red-600',
    bg: 'bg-red-600',
  },
}

function ProgressBar({
  count,
  total,
  status,
  platform,
}: CacheStats['twitchfollowers'] & { platform: 'twitch' | 'youtube' }) {
  let percent = `${
    count === 0 && total === 0 && status === 'done' ? 100 : Math.min(100, (count / total) * 100).toFixed(0)
  }%`
  if (status === 'inprogress' && count === 0 && total === 0) percent = `0%`
  return (
    <div
      className={cls(
        'bg-gray-300 rounded-lg flex-1 h-2 overflow-hidden border-b border-purple-600',
        PLATFORM_THEME[platform]?.border
      )}
      title={percent}
    >
      <div className={cls('bg-purple-600 h-full', PLATFORM_THEME[platform]?.bg)} style={{ width: percent }}></div>
    </div>
  )
}

function StatusIcon({ status, lastUpdated }: Pick<CacheStats['twitchfollowers'], 'status' | 'lastUpdated'>) {
  const title = lastUpdated ? `Last updated: ${format(lastUpdated, 'dd/MM hh:mm')}` : ''
  return status === 'done' ? (
    <FaCheckCircle title={title} className="text-green-600" />
  ) : status === 'error' ? (
    <FaExclamationCircle title={title} className="text-red-600" />
  ) : (
    <FaSpinner title={title} className="animate-spin" />
  )
}

export default function Stats({ stats, cacheHistory }: { stats: CacheStats; cacheHistory: CacheHistory }) {
  const [fullView, setFullView] = React.useState(false)
  const isBeta = useBeta()
  const session = useSession()
  return (
    <>
      {fullView ? <FullView stats={stats} cacheHistory={cacheHistory} isBeta={isBeta} /> : null}
      <div
        className={`flex flex-row gap-6 mt-2 mx-3 text-xs justify-center items-center ${
          fullView ? 'opacity-100' : 'opacity-60'
        } hover:opacity-100 transition-opacity`}
      >
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="bg-purple-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
            <FaTwitch /> Followers
          </div>
          <ProgressBar platform="twitch" {...stats.twitchfollowers} />
          <StatusIcon status={stats.twitchfollowers.status} lastUpdated={stats.twitchfollowers.lastUpdated} />
        </div>
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="bg-purple-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
            <FaTwitch /> Subscribers
          </div>
          <ProgressBar platform="twitch" {...stats.twitchsubs} />
          <StatusIcon status={stats.twitchsubs.status} lastUpdated={stats.twitchsubs.lastUpdated} />
        </div>
        {isBeta ? (
          <>
            <div className="flex flex-row gap-2 justify-center items-center flex-1">
              <div className="bg-red-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
                <FaYoutube /> Subscribers
              </div>
              <ProgressBar platform="youtube" {...stats.youtubefollowers} />
              <StatusIcon
                status={!session?.data?.youtube ? 'error' : stats.youtubefollowers.status}
                lastUpdated={stats.youtubefollowers.lastUpdated}
              />
            </div>
            <div className="flex flex-row gap-2 justify-center items-center flex-1">
              <div className="bg-red-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
                <FaYoutube /> Members
              </div>
              <ProgressBar platform="youtube" {...stats.youtubesubs} />
              <StatusIcon
                status={!session?.data?.youtube ? 'error' : stats.youtubesubs.status}
                lastUpdated={stats.youtubesubs.lastUpdated}
              />
            </div>
          </>
        ) : null}
        {isBeta ? (
          <button
            className="bg-red-600 py-1 px-2 rounded-md flex flex-row gap-1 justify-center items-center"
            onClick={() => {
              console.info('[youtube] Forcing full sub sync')
              toast.success('Forcing full subscription sync', {
                position: 'bottom-right',
                style: { fontSize: '0.8rem', padding: '0.2rem' },
              })
              localStorage.removeItem(YOUTUBE_STORAGE_KEYS.LastSubKey)
              localStorage.setItem(YOUTUBE_STORAGE_KEYS.ForceSubs, 'true')
            }}
          >
            <FaYoutube /> Force Sync
          </button>
        ) : null}
        <button className="bg-purple-600 p-1 rounded-md" onClick={() => setFullView((v) => !v)}>
          {fullView ? <FaAngleDown /> : <FaAngleUp />}
        </button>
      </div>
    </>
  )
}

const NOW = new Date()
const EMPTY_GRAPH = [
  { count: 0, time: format(NOW, 'HH:mm'), fullTime: format(NOW, 'dd/MM HH:mm'), name: NOW.toISOString() },
]

function graphOrEmpty(items: any[]) {
  return items.length === 0 ? EMPTY_GRAPH : items
}

function FullView({ stats, cacheHistory, isBeta }: { stats: CacheStats; cacheHistory: CacheHistory; isBeta: Boolean }) {
  return (
    <div className="bg-gray-700 flex-2 mt-2 rounded-md px-3 pt-3 flex flex-col gap-2">
      <div className="flex flex-col gap-2 flex-1">
        <div className="text-sm flex flex-row justify-center items-center gap-2">
          <div className="flex flex-row gap-2 justify-center items-center flex-1">
            <div className="bg-purple-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
              <FaTwitch /> Followers {Intl.NumberFormat().format(stats.twitchfollowers.count)} /{' '}
              {Intl.NumberFormat().format(Math.max(stats.twitchfollowers.total, stats.twitchfollowers.count))}{' '}
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-center items-center flex-1">
            <div className="bg-purple-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
              <FaTwitch /> Subscribers {Intl.NumberFormat().format(stats.twitchsubs.count)} /{' '}
              {Intl.NumberFormat().format(Math.max(stats.twitchsubs.total, stats.twitchsubs.count))}
            </div>
          </div>
        </div>
        <div className="opacity-60 flex flex-row text-xs -mt-1 justify-center items-center gap-2">
          <div className="flex flex-row gap-2 justify-center items-center flex-1">
            <div className="rounded-md text-center">
              Last Updated:{' '}
              {stats.twitchfollowers.lastUpdated
                ? format(stats.twitchfollowers.lastUpdated, 'dd/MM/yy hh:mm')
                : '??/??/?? ??:??'}
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-center items-center flex-1">
            <div className="rounded-md text-center">
              Last Updated:{' '}
              {stats.twitchsubs.lastUpdated ? format(stats.twitchsubs.lastUpdated, 'dd/MM/yy hh:mm') : '??/??/?? ??:??'}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-row justify-center items-center gap-2">
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphOrEmpty(cacheHistory.twitchFollowers.slice(-30))}>
                <XAxis dataKey="time" />
                <YAxis min={0} />
                <Tooltip content={<CustomTooltip />} />
                <Area dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphOrEmpty(cacheHistory.twitchSubs.slice(-30))}>
                <XAxis dataKey="time" />
                <YAxis min={0} />
                <Tooltip content={<CustomTooltip />} />
                <Area dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {isBeta ? (
        <div className="flex flex-col gap-2 flex-1">
          <div className="text-sm flex flex-row justify-center items-center gap-2">
            <div className="flex flex-row gap-2 justify-center items-center flex-1">
              <div className="bg-red-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
                <FaYoutube /> Subscribers {Intl.NumberFormat().format(stats.youtubefollowers.count)} /{' '}
                {Intl.NumberFormat().format(Math.max(stats.youtubefollowers.total, stats.youtubefollowers.count))}{' '}
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center flex-1">
              <div className="bg-red-600 rounded-md text-center px-2 py-0.5 flex flex-row gap-1 justify-center items-center">
                <FaYoutube /> Members {Intl.NumberFormat().format(stats.youtubesubs.count)} /{' '}
                {Intl.NumberFormat().format(Math.max(stats.youtubesubs.total, stats.youtubesubs.count))}
              </div>
            </div>
          </div>
          <div className="opacity-60 flex flex-row text-xs -mt-1 justify-center items-center gap-2">
            <div className="flex flex-row gap-2 justify-center items-center flex-1">
              <div className="rounded-md text-center">
                Last Updated:{' '}
                {stats.youtubefollowers.lastUpdated
                  ? format(stats.youtubefollowers.lastUpdated, 'dd/MM/yy hh:mm')
                  : '??/??/?? ??:??'}
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center flex-1">
              <div className="rounded-md text-center">
                Last Updated:{' '}
                {stats.youtubesubs.lastUpdated
                  ? format(stats.youtubesubs.lastUpdated, 'dd/MM/yy hh:mm')
                  : '??/??/?? ??:??'}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-row justify-center items-center gap-2">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphOrEmpty(cacheHistory.youtubeFollowers.slice(-30))}>
                  <XAxis dataKey="time" />
                  <YAxis min={0} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area dataKey="count" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphOrEmpty(cacheHistory.youtubeSubs.slice(-30))}>
                  <XAxis dataKey="time" />
                  <YAxis min={0} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area dataKey="count" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
      <div className="text-xs opacity-40 text-center relative -top-2 -mt-2">
        These numbers may appear high, as unfollows/unsubs aren't tracked
      </div>
    </div>
  )
}

function CustomTooltip({ payload, active }: any) {
  if (!active || !payload || !payload[0]) return null
  return (
    <div>
      <div>{payload[0]?.payload?.fullTime}</div>
      <div>Count: {(payload[0]?.payload?.count || 0).toFixed(0)}</div>
    </div>
  )
}
