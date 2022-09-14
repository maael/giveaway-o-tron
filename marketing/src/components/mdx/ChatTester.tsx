import { useEffect, useState } from 'react'

const specialCommands = {
  $gw2_account$: /(^|\s)\w+\.\d{4}($|\s)/,
  $steam_friend$: /(^|\s)\d{8}($|\s)/,
  $gw2_or_steam$: /(^|\s)\w+\.\d{4}($|\s)|(^|\s)\d{8}($|\s)/,
}

const specialCommandsForCombination = {
  $gw2_account$: '\\w+\\.\\d{4}',
  $steam_friend$: '\\d{8}',
  $gw2_or_steam$: '\\w+\\.\\d{4}|\\d{8}',
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export function handleChatCommand(msg: string, command: string): { isMatch: boolean; match: string } {
  const cleanCommand = command.trim()
  let translatedCommand: string | RegExp = specialCommands[cleanCommand] || cleanCommand
  const matchingCommand = Object.keys(specialCommandsForCombination).some(
    (k) => cleanCommand.includes(k) && cleanCommand !== k
  )
  if (matchingCommand) {
    const tranformedCommand = new RegExp(
      cleanCommand
        .split(' ')
        .map((c) => specialCommandsForCombination[c] || escapeRegExp(c))
        .join(' '),
      'i'
    )
    translatedCommand = tranformedCommand
  }
  if (typeof translatedCommand === 'string') {
    return {
      isMatch: translatedCommand ? msg.toLowerCase().includes(translatedCommand.toLowerCase()) : true,
      match: '',
    }
  } else {
    return { isMatch: msg.match(translatedCommand) !== null, match: '' }
  }
}

export default function ChatTester() {
  const [msgs, setMsgs] = useState<{ match: boolean; msg: string }[]>([])
  const [cmd, setCmd] = useState('')
  useEffect(() => {
    setMsgs((m) =>
      m.map((i) => ({
        ...i,
        match: handleChatCommand(i.msg, cmd).isMatch,
      }))
    )
  }, [cmd, msgs.length])
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-col">
        <div className="bg-gray-900 px-4 py-2 rounded-t-md mx-2 flex flex-col gap-1">
          {msgs.length === 0
            ? 'Messages will appear here...'
            : msgs.map(({ msg, match }, i) => (
                <div
                  key={i}
                  className={`flex flex-row gap-2 justify-start items-center px-1.5 py-0.5 rounded-md ${
                    match ? 'bg-green-600 bg-opacity-20' : ''
                  }`}
                >
                  <div className="text-purple-300">Test User:</div>
                  <pre className="flex-1 font-sans">{msg}</pre>
                  {match ? <div className="text-xs bg-green-600 px-1.5 py-0.5 rounded-md">Match</div> : null}
                </div>
              ))}
        </div>
        <form
          className="flex flex-row justify-center items-center text-lg"
          onSubmit={(e) => {
            e.preventDefault()
            const nameEl = e.currentTarget.elements.namedItem('msg') as HTMLInputElement
            const newMsg = nameEl.value
            if (!newMsg) return
            setMsgs((m) => m.slice(-6).concat({ msg: newMsg, match: false }))
            e.currentTarget.reset()
          }}
        >
          <span className="bg-purple-700 border border-purple-700 rounded-l-md px-2 w-32 text-center">Message</span>
          <input
            name="msg"
            className="flex-1 overflow-ellipsis border-b border-purple-700 px-2 text-black bg-white"
            placeholder="Message..."
          />
          <button className="bg-purple-700 px-2 rounded-r-md w-20">Send</button>
        </form>
      </div>

      <div className="flex flex-row justify-center items-center text-lg">
        <span className="bg-purple-700 border border-purple-700 rounded-l-md px-2 w-32 text-center">Command</span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          className="flex-1 overflow-ellipsis border-b border-purple-700 px-2 text-black bg-white rounded-r-md"
          placeholder="Chat Command..."
        />
      </div>
    </div>
  )
}
