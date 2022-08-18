import React, { Dispatch, SetStateAction } from 'react'
import { ChatItem } from '../../chat'
import { Settings as TSettings, removeIdx, ChannelInfo } from '../../utils'
import chat from '../../chat'
import Settings from '../primitives/Settings'
import { Winner, InstantGiveaway, ChatGiveaway, WinnerUser } from '../primitives/giveaways'
import ChatBox from '../primitives/ChatBox'

export default function MainScreen({
  chatEvents,
  settings,
  setSettings,
  channelInfo,
  client,
}: {
  client: ReturnType<typeof chat> | null
  chatEvents: ChatItem[]
  settings: TSettings
  setSettings: Dispatch<SetStateAction<TSettings>>
  isConnected: boolean
  channelInfo: ChannelInfo
}) {
  const [winners, setWinners] = React.useState<WinnerUser[]>([])
  return (
    <>
      <Winner winners={winners} onClear={(idx) => setWinners((w) => removeIdx(w, idx))} />
      <div className="flex flex-row gap-2">
        <InstantGiveaway settings={settings} channelInfo={channelInfo} setWinners={setWinners} client={client} />
        <ChatGiveaway
          settings={settings}
          channelInfo={channelInfo}
          chatEvents={chatEvents}
          setWinners={setWinners}
          client={client}
        />
      </div>
      <Settings settings={settings} setSettings={setSettings} />
      <ChatBox chatEvents={chatEvents} winners={winners} />
    </>
  )
}
