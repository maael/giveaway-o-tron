import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { FaPlusSquare as PlusIco, FaTimes as RemoveIco } from 'react-icons/fa'
import { v4 } from 'uuid'

export interface ControlConfig {
  id: string
  name: string
  actions: string[]
  command: string
  team?: string
}

export default function ControlsConfigScreen({
  controls,
  setControls,
}: {
  controls: ControlConfig[]
  setControls: Dispatch<SetStateAction<ControlConfig[]>>
}) {
  return (
    <div className="mt-3">
      <h2 className="text-center">
        {controls.length} Control{controls.length === 1 ? '' : 's'}
      </h2>
      <div className="flex flex-col gap-3 mt-2">
        <div className="grid grid-cols-4 gap-2 border-b border-gray-700 pb-1 px-1">
          <span>Name</span>
          <span>Chat Command</span>
          <span>Action</span>
          <span>Team</span>
        </div>
        {controls.map((c) => (
          <ControlRow
            key={c.id}
            config={c}
            onUpdate={(item) => {
              const idx = controls.findIndex(({ id }) => id === item.id)
              const updated = controls
                .slice(0, idx)
                .concat(item)
                .concat(controls.slice(idx + 1))
              setControls(updated)
            }}
            onRemove={(item) => {
              setControls((c) => c.filter((i) => i.id !== item.id))
            }}
          />
        ))}
        <button
          className="flex justify-center items-center py-2 w-full transform hover:translate-y-1 transition-transform hover:text-green-400 mb-3"
          onClick={() => setControls((c) => c.concat([{ id: v4(), name: '', command: '', actions: [] }]))}
        >
          <PlusIco />
        </button>
      </div>
    </div>
  )
}

function KeyCaptureInput({
  onCaptured,
  value,
  ...props
}: React.HTMLProps<HTMLInputElement> & {
  value: string[]
  onCaptured: (captured: string[]) => void
}) {
  const [capturing, setCapturing] = React.useState(false)
  const [captured, setCaptured] = React.useState<string[]>(value || [])
  return (
    <input
      {...props}
      onFocus={(e) => {
        e.preventDefault()
        setCapturing(true)
        setCaptured([])
      }}
      onWheel={(e) => {
        setCaptured((c) => [...new Set(c.concat(e.deltaY > 0 ? 'Scroll Down' : 'Scroll Up'))])
      }}
      onBlur={(e) => {
        setCapturing(false)
        onCaptured(captured)
      }}
      onKeyDown={(e) => {
        e.preventDefault()
        const key = e.key === ' ' ? 'Space' : e.key
        setCaptured((c) => [...new Set(c.concat(key))])
      }}
      onMouseDown={(e) => {
        if (!capturing) return
        e.preventDefault()
        const mouseClickType = e.button === 1 ? 'Middle Click' : e.button === 2 ? 'Right Click' : 'Click'
        setCaptured((c) => [...new Set(c.concat(mouseClickType))])
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        return false
      }}
      placeholder={capturing ? 'Capturing...' : props.placeholder}
      value={captured.join('+')}
      onChange={(e) => e.preventDefault()}
    />
  )
}

function ControlRow({
  config,
  onUpdate,
  onRemove,
}: {
  config: ControlConfig
  onUpdate: (update: ControlConfig) => void
  onRemove: (update: ControlConfig) => void
}) {
  const [item, setItem] = React.useState(config)
  const { name: actionName, command, team, actions } = item
  useEffect(() => {
    onUpdate(item)
  }, [item])
  return (
    <div className="grid grid-cols-4 gap-2 relative">
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Command Name"
        value={actionName}
        onChange={(e) => setItem((i) => ({ ...i, name: e.target.value }))}
      />
      <input
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Chat Command"
        value={command}
        onChange={(e) => setItem((i) => ({ ...i, command: e.target.value }))}
      />
      <KeyCaptureInput
        className="bg-gray-700 px-2 py-1 flex-1"
        placeholder="Action"
        value={actions}
        onCaptured={(keys) => setItem((i) => ({ ...i, actions: keys }))}
      />
      <input
        className="bg-gray-700 px-2 py-1 flex-1 mr-7"
        placeholder="Team"
        value={team || 'Default'}
        onChange={(e) => setItem((i) => ({ ...i, team: e.target.value }))}
      />
      <div className="absolute top-0 bottom-0 right-2 flex items-center">
        <RemoveIco
          className="cursor-pointer transform hover:scale-110 hover:text-red-500"
          onClick={() => onRemove(config)}
        />
      </div>
    </div>
  )
}
