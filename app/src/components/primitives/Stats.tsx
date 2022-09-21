import React from 'react'
import { FaAngleDown, FaAngleUp, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa'
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts'
import format from 'date-fns/format'
import { CacheHistory, CacheStats } from '~/utils'

function ProgressBar({ count, total, status }: CacheStats['followers']) {
  let percent = `${
    count === 0 && total === 0 && status === 'done' ? 100 : Math.min(100, (count / total) * 100).toFixed(0)
  }%`
  if (status === 'inprogress' && count === 0 && total === 0) percent = `0%`
  return (
    <div className="bg-gray-300 rounded-lg flex-1 h-2 overflow-hidden border-b border-purple-600" title={percent}>
      <div className="bg-purple-600 h-full" style={{ width: percent }}></div>
    </div>
  )
}

function StatusIcon({ status, lastUpdated }: Pick<CacheStats['followers'], 'status' | 'lastUpdated'>) {
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
  return (
    <>
      {fullView ? <FullView stats={stats} cacheHistory={cacheHistory} /> : null}
      <div
        className={`flex flex-row gap-6 mt-2 mx-3 text-xs justify-center items-center ${
          fullView ? 'opacity-100' : 'opacity-60'
        } hover:opacity-100 transition-opacity`}
      >
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="bg-purple-600 rounded-md text-center px-2 py-0.5">Followers</div>
          <ProgressBar {...stats.followers} />
          <StatusIcon status={stats.followers.status} lastUpdated={stats.followers.lastUpdated} />
        </div>
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="bg-purple-600 rounded-md text-center px-2 py-0.5">Subscribers</div>
          <ProgressBar {...stats.subs} />
          <StatusIcon status={stats.subs.status} lastUpdated={stats.subs.lastUpdated} />
        </div>
        <button className="bg-purple-600 p-1 rounded-md" onClick={() => setFullView((v) => !v)}>
          {fullView ? <FaAngleDown /> : <FaAngleUp />}
        </button>
      </div>
    </>
  )
}

function FullView({ stats, cacheHistory }: { stats: CacheStats; cacheHistory: CacheHistory }) {
  return (
    <div className="bg-gray-700 flex-3 mt-2 rounded-md px-3 pt-3 flex flex-col gap-2">
      <div className="text-sm flex flex-row justify-center items-center gap-2">
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="bg-purple-600 rounded-md text-center px-2 py-0.5">
            {Intl.NumberFormat().format(stats.followers.count)} /{' '}
            {Intl.NumberFormat().format(Math.max(stats.followers.total, stats.followers.count))} Followers
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="bg-purple-600 rounded-md text-center px-2 py-0.5">
            {Intl.NumberFormat().format(stats.subs.count)} /{' '}
            {Intl.NumberFormat().format(Math.max(stats.subs.total, stats.subs.count))} Subscribers
          </div>
        </div>
      </div>
      <div className="opacity-60 flex flex-row text-xs -mt-1 justify-center items-center gap-2">
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="rounded-md text-center">
            Last Updated: {stats.followers.lastUpdated ? format(stats.followers.lastUpdated, 'dd/MM/yy hh:mm') : ''}
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center flex-1">
          <div className="rounded-md text-center">
            Last Updated: {stats.subs.lastUpdated ? format(stats.subs.lastUpdated, 'dd/MM/yy hh:mm') : ''}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-row justify-center items-center gap-2">
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cacheHistory.followers.slice(-30)}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cacheHistory.subs.slice(-30)}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
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
