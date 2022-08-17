import React, { Dispatch, SetStateAction, useEffect } from 'react'
import {
  FaArrowRight as RightIco,
  FaChartBar as DemocracyIco,
  FaClock as ClockIco,
  FaKeyboard as ControlsIco,
  FaUsers as TeamIco,
} from 'react-icons/fa'
import { GiAnarchy as AnarchyIco, GiTopHat as BaronIco } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import cls from 'classnames'
import { ChatItem } from '../../chat'
import Results from '../primitives/Results'
import { ControlConfig } from './ControlsConfig'
import { Settings } from '../../utils'

function ProgressBar({
  waitDuration,
  timeFrom,
  paused,
}: {
  waitDuration: number
  timeFrom: Date | null
  paused: boolean
}) {
  /**
   * TODO: Set initial progress correctly, based on time from and wait duration and % through
   */
  const [progress, setProgress] = React.useState(100)
  useEffect(() => {
    setProgress(100)
  }, [timeFrom, paused])
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setProgress((p) => Math.max(p - 0.1, 0))
    }, (waitDuration / 100) * 100)
    return () => {
      clearInterval(interval)
    }
  }, [paused, waitDuration, timeFrom])
  return (
    <div className="bg-gray-300 absolute top-8 right-0 left-0 h-2 shadow-md">
      <div className="bg-purple-600 h-full" style={{ width: `${progress}%` }} />
    </div>
  )
}

export default function MainScreen({
  chatEvents,
  lastAction,
  settings,
  setSettings,
  controlCount,
  lastCheckAt,
  isConnected,
  controls,
  baron,
}: {
  chatEvents: ChatItem[]
  lastAction: string | null
  settings: Settings
  setSettings: Dispatch<SetStateAction<Settings>>
  controlCount: number
  lastCheckAt: Date | null
  isConnected: boolean
  controls: ControlConfig[]
  baron: string | null
}) {
  return (
    <>
      <div className="grid gap-2 grid-cols-2 mt-3">
        <Link to="/config/controls" title="Edit controls config">
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:scale-105 hover:shadow-lg transition-transform cursor-pointer">
            <div className="flex-1 flex justify-center items-center gap-2">
              <ControlsIco /> {controlCount} Control{controlCount === 1 ? '' : 's'}
            </div>
            <RightIco />
          </div>
        </Link>
        <Link to="/config/teams" title="Edit teams config">
          <div className="bg-gray-600 px-3 py-1 rounded-md shadow-md flex flex-row items-center transform hover:scale-105 hover:shadow-lg transition-transform cursor-pointer">
            <div className="flex-1 flex justify-center items-center gap-2">
              <TeamIco /> 1 Team
            </div>
            <RightIco />
          </div>
        </Link>
      </div>
      <div className="grid gap-2 grid-cols-3 mt-2">
        <div
          className={cls('w-full shadow-md grid grid-cols-2 items-center overflow-hidden', {
            'opacity-60 pointer-events-none': settings.mode === 'anarchy',
          })}
          title="How long to ready chat for before doing what it says in democracy mode"
        >
          <input
            className="bg-gray-700 px-2 py-1 flex-1 shadow-md outline-none text-right rounded-l-md border-b border-l border-purple-500"
            placeholder="Wait Time..."
            value={settings.waitDuration}
            type="number"
            onChange={(e) => setSettings((s) => ({ ...s, waitDuration: e.target.valueAsNumber }))}
          />
          <span className="flex justify-start gap-2 items-center bg-gray-600 px-2 py-1 rounded-r-md border-b border-gray-600 cursor-help">
            <ClockIco /> Wait (s)
          </span>
        </div>
        <div className="w-full shadow-md grid grid-cols-3 items-center overflow-hidden rounded-md col-span-2">
          <button
            className={cls(
              'flex justify-center items-center gap-1 flex-1 text-center h-full w-full py-1 bg-gray-600 cursor-pointer hover:bg-purple-700',
              {
                'bg-purple-600': settings.mode === 'democracy',
              }
            )}
            title="Perform the top voted action in the wait time"
            onClick={() => setSettings((s) => ({ ...s, mode: 'democracy' }))}
          >
            <DemocracyIco style={{ position: 'relative', top: 1 }} /> Democracy
          </button>
          <button
            className={cls(
              'flex justify-center items-center gap-1 flex-1 text-center h-full w-full py-1 bg-gray-600 cursor-pointer hover:bg-purple-700',
              {
                'bg-purple-600': settings.mode === 'anarchy',
              }
            )}
            title="Perform all actions in the wait time"
            onClick={() => setSettings((s) => ({ ...s, mode: 'anarchy' }))}
          >
            <AnarchyIco /> Anarchy
          </button>
          <button
            className={cls(
              'flex justify-center items-center gap-1 flex-1 text-center h-full w-full py-1 bg-gray-600 cursor-pointer hover:bg-purple-700',
              {
                'bg-purple-600': settings.mode === 'baron',
              }
            )}
            title="During each time frame, a selected chat baron takes the wheel"
            onClick={() => setSettings((s) => ({ ...s, mode: 'baron' }))}
          >
            <BaronIco /> Baron
          </button>
        </div>
      </div>
      <Results baron={baron} mode={settings.mode} config={controls} chatItems={chatEvents} />
      <div className="mt-2 rounded-md bg-gray-700 flex-1 flex flex-col relative overflow-hidden">
        <div className="bg-gray-600 absolute top-0 right-0 left-0 h-8 flex justify-between px-10 items-center text-white">
          <div>Last action: {lastAction || 'None'}</div>
          <div>
            {chatEvents.length} message{chatEvents.length === 1 ? '' : 's'}
          </div>
        </div>
        {['baron', 'democracy'].includes(settings.mode) ? (
          <ProgressBar waitDuration={settings.waitDuration} timeFrom={lastCheckAt} paused={!isConnected} />
        ) : null}
        <div className="relative flex-1">
          {chatEvents.length === 0 ? (
            <span
              className={cls('relative left-2', {
                'top-9': settings.mode === 'anarchy',
                'top-12': ['baron', 'democracy'].includes(settings.mode),
              })}
            >
              Logs will appear here...
            </span>
          ) : (
            <div
              className={cls('absolute right-0 left-0 bottom-0 overflow-y-scroll px-2 pt-1 pb-3 flex flex-col gap-1', {
                'top-8': settings.mode === 'anarchy',
                'top-10': ['baron', 'democracy'].includes(settings.mode),
              })}
            >
              {chatEvents.map((c) => {
                return (
                  <div key={c.id}>
                    <span className="rounded-full bg-purple-700 h-4 w-4 inline-block mr-1">
                      <span className="flex justify-center items-center text-xs" title={`Team: ${'Default'}`}>
                        D
                      </span>
                    </span>
                    <span style={{ color: c.color }}>[{c.displayName}]</span>{' '}
                    {highlightAction(settings.mode, controls, c.displayName, c.msg, baron)}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function highlightAction(
  mode: Settings['mode'],
  controls: ControlConfig[],
  displayName: string,
  msg: string,
  baron?: string | null
): React.ReactNode[] {
  const commands = controls.map(({ command }) => command.toLowerCase())
  const words = msg.split(' ')
  const matchIdx = words.findIndex((w, i) => {
    return commands.some((c) => c === w.toLowerCase())
  }, [])
  return ((mode === 'baron' && displayName === baron) || mode !== 'baron') && matchIdx > -1
    ? [
        words.slice(0, matchIdx).join(' '),
        <span
          key="highlight"
          className="bg-purple-500 text-white rounded-sm font-bold text-center"
          style={{ padding: '1px 2px', margin: '0px 4px' }}
        >
          {' '}
          {words[matchIdx]}{' '}
        </span>,
        words.slice(matchIdx + 1).join(' '),
      ]
    : [msg]
}
