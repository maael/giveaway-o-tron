import React from 'react'
import { getTeamCommandVotes, Settings } from '../../utils'
import { ChatItem } from '../../chat'
import { ControlConfig } from '../screens/ControlsConfig'

export default function Results({
  mode,
  config,
  chatItems,
  baron,
}: {
  mode: Settings['mode']
  config: ControlConfig[]
  chatItems: ChatItem[]
  baron?: string | null
}) {
  const results = React.useMemo(
    () => getTeamCommandVotes(mode, config, chatItems, baron),
    [mode, config, chatItems, baron]
  )
  const mappedConfig = React.useMemo(() => new Map(config.map((c) => [c.command, c])), [config])
  const totalVotes = React.useMemo(
    () => Object.values(results).reduce((acc, r) => acc + Object.values(r).reduce((acc, v) => acc + v, 0), 0),
    [results]
  )
  const filteredChatItems =
    mode !== 'baron' ? chatItems : !baron ? [] : chatItems.filter((c) => c.displayName === baron)
  return (
    <div className="mt-2 rounded-md bg-gray-700 flex flex-col">
      <div className="bg-gray-600 flex justify-between px-10 items-center text-white rounded-t-md">
        <div>
          {mode === 'democracy'
            ? `${totalVotes} vote${totalVotes === 1 ? '' : 's'}`
            : mode === 'baron'
            ? `Baron: ${baron || 'Choosing...'}`
            : null}
        </div>
        <div>
          {filteredChatItems.length} message{filteredChatItems.length === 1 ? '' : 's'}
        </div>
      </div>
      <div className="flex-1 px-3 pt-1 pb-2 gap-2">
        {Object.keys(results).length === 0 ? 'Waiting...' : null}
        {Object.entries(results).map(([team, cmds], _, ar) => (
          <div key={team} className="flex-1">
            {ar.length === 1 && team === 'default' ? null : (
              <div className="text-purple-400 uppercase font-bold">{team}</div>
            )}
            <div className="grid grid-cols-2 gap-x-20 gap-y-2">
              {Object.entries(cmds).map(([cmd, votes]) => (
                <div key={cmd} className="flex flex-row gap-5 items-center">
                  <div className="flex-1 flex flex-row items-center gap-2">
                    <div>{cmd}</div>
                    <div className="text-xs bg-purple-400 px-2 py-1 rounded-sm">{mappedConfig.get(cmd)?.name}</div>
                  </div>
                  <div className="flex-1 flex flex-row bg-gray-200 h-2 rounded-sm">
                    <div className="bg-purple-500 transition-all" style={{ width: `${(votes / totalVotes) * 100}%` }} />
                  </div>
                  <div className="text-right">{votes}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
