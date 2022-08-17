import * as React from 'react'
import { FaPlusSquare as PlusIco, FaTimes as RemoveIco } from 'react-icons/fa'
import { v4 } from 'uuid'

export default function TeamsConfigScreen() {
  const [teams, setTeams] = React.useState([{ id: v4(), name: 'Default' }])
  return (
    <div className="mt-3">
      <h2 className="text-center">
        {teams.length} Team{teams.length === 1 ? '' : 's'}
      </h2>
      <h2 className="text-center text-xs text-red-500 opacity-90">Warning: Does nothing at the moment</h2>
      <div className="flex flex-col gap-3 mt-2">
        <div className="grid grid-cols-4 gap-2 border-b border-gray-700 pb-1 px-1">
          <span>Name</span>
          <span>Subscribers?</span>
          <span>Split</span>
          <span>Count</span>
        </div>
        {teams.map((c) => (
          <TeamConfigRow
            key={c.id}
            config={c}
            canDelete={teams.length > 1}
            onUpdate={() => undefined}
            onDelete={() => undefined}
          />
        ))}

        <button
          className="flex justify-center items-center py-2 w-full transform hover:translate-y-1 transition-transform hover:text-green-400"
          onClick={() => setTeams((c) => c.concat([{ id: v4(), name: 'New Team' }]))}
        >
          <PlusIco />
        </button>
      </div>
    </div>
  )
}

function TeamConfigRow({
  config,
  onUpdate,
  onDelete,
  canDelete,
}: {
  config: any
  canDelete: boolean
  onUpdate: (update: any) => void
  onDelete: (update: any) => void
}) {
  const [item, setItem] = React.useState(config)
  React.useEffect(() => {
    onUpdate(item)
  }, [item])
  return (
    <div className="grid grid-cols-4 gap-2 relative">
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Team Name"
        value={config.name}
        onChange={() => undefined}
      />
      <div className="self-center m-auto">
        <input type="checkbox" />
      </div>
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Split"
        value={config.split}
        onChange={() => undefined}
        disabled
      />
      <input
        className="bg-gray-700 px-2 py-1 mr-7"
        placeholder="Count"
        value={config.count}
        onChange={() => undefined}
        disabled
      />
      <div className="absolute top-0 bottom-0 right-2 flex items-center">
        {canDelete ? <RemoveIco className="cursor-pointer transform hover:scale-110 hover:text-red-500" /> : null}
      </div>
    </div>
  )
}
