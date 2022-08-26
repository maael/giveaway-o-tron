import React from 'react'
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa'
import { CacheStats } from '~/utils'

function ProgressBar({ count, total, status }: CacheStats['followers']) {
  let percent = `${Math.min(100, (count / total) * 100).toFixed(0)}%`
  if (status === 'inprogress' && count === 0 && total === 0) percent = `0%`
  return (
    <div className="bg-gray-300 rounded-lg flex-1 h-2 overflow-hidden border-b border-purple-600" title={percent}>
      <div className="bg-purple-600 h-full" style={{ width: percent }}></div>
    </div>
  )
}

function StatusIcon({ status }: Pick<CacheStats['followers'], 'status'>) {
  return status === 'done' ? (
    <FaCheckCircle className="text-green-600" />
  ) : status === 'error' ? (
    <FaExclamationCircle className="text-red-600" />
  ) : (
    <FaSpinner className="animate-spin" />
  )
}

export default function Stats({ stats }: { stats: CacheStats }) {
  return (
    <div className="flex flex-row gap-6 mt-2 mx-3 text-xs justify-center items-center opacity-60 hover:opacity-100 transition-opacity">
      <div className="flex flex-row gap-2 justify-center items-center flex-1">
        <div className="bg-purple-600 rounded-md text-center px-2 py-0.5">Followers</div>
        <ProgressBar {...stats.followers} />
        <StatusIcon status={stats.followers.status} />
      </div>
      <div className="flex flex-row gap-2 justify-center items-center flex-1">
        <div className="bg-purple-600 rounded-md text-center px-2 py-0.5">Subscribers</div>
        <ProgressBar {...stats.subs} />
        <StatusIcon status={stats.subs.status} />
      </div>
    </div>
  )
}
