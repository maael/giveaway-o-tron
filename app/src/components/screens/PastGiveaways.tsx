import React, { Dispatch, SetStateAction } from 'react'
import { FaCheck, FaClock, FaTimes } from 'react-icons/fa'
import formatToNow from 'date-fns/formatDistanceToNow'
import format from 'date-fns/format'
import { GiveawayResult, GiveawayType } from '~/utils'

const typeNameMap: Record<GiveawayType, string> = {
  [GiveawayType.Chat]: 'Active Chatter Giveaway',
  [GiveawayType.Instant]: 'Viewers Instant Giveaway',
}

function SettingItem<T>({ label, value }: { label: string; value: T }) {
  return (
    <div className="flex flex-row justify-center items-center flex-1">
      <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md">{label}</div>
      <div className="bg-gray-600 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1 overflow-ellipsis h-full max-w-full flex justify-center items-center">
        {typeof value === 'boolean' ? value ? <FaCheck /> : <FaTimes /> : value}
      </div>
    </div>
  )
}
const LIMIT_GIVEAWAY_LIST = 10
export default function PastGiveaways({
  giveaways,
  setPastGiveaways,
}: {
  giveaways: GiveawayResult[]
  setPastGiveaways: Dispatch<SetStateAction<GiveawayResult[]>>
}) {
  return (
    <div className="mt-4 flex flex-col gap-5 flex-1 pb-5">
      <h1 className="text-3xl flex items-center">
        Last {Math.min(giveaways.length, LIMIT_GIVEAWAY_LIST)} of {giveaways.length} Total Past Giveaway
        {giveaways.length === 1 ? '' : 's'}
      </h1>
      {giveaways.slice(0, LIMIT_GIVEAWAY_LIST).map((giveaway, idx) => (
        <div key={idx} className="border border-purple-600 rounded-md px-3 py-2 flex flex-col gap-2 bg-gray-700">
          <div className="flex flex-row gap-1 justify-between font-bold">
            {typeNameMap[giveaway.type]}
            <div
              title={format(new Date(giveaway.createdAt), 'PPPppp')}
              className="flex flex-row gap-1 justify-center items-center"
            >
              <FaClock className="text-xs" />
              {formatToNow(new Date(giveaway.createdAt), { addSuffix: true })}
            </div>
          </div>
          <div className="flex flex-row justify-center items-center flex-1">
            <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md">Notes</div>
            <input
              className="bg-gray-600 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1 overflow-ellipsis h-full max-w-full flex justify-center items-center"
              placeholder="Notes..."
              value={giveaway.notes || ''}
              onChange={(e) =>
                setPastGiveaways((p) => {
                  const giveawayIdxToChange = p.findIndex((i) => i.createdAt === giveaway.createdAt)
                  if (giveawayIdxToChange === -1) return p
                  const clone = JSON.parse(JSON.stringify(p))
                  clone[giveawayIdxToChange].notes = e.target.value
                  return clone
                })
              }
            />
          </div>
          <div>
            <div className="border-b border-purple-600 mb-2">Winners</div>
            <div className="flex flex-col gap-2 px-2">
              {giveaway.winners.map((w, widx) => (
                <div
                  key={`${idx}-${widx}`}
                  className="border border-purple-600 rounded-md flex flex-row gap-1 flex-1 items-center"
                >
                  <div className="bg-purple-600 text-white h-full flex justify-center items-center px-3 py-2">
                    {w.login}
                  </div>
                  <div className="px-3 py-2 flex flex-row gap-3 flex-1">
                    <div className="flex flex-row items-center gap-1">
                      Sub:{' '}
                      {w.wasSubscriber ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-600" />}
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      Follower:{' '}
                      {w.wasFollower ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-600" />}
                    </div>
                    <div className="flex flex-row justify-center items-center flex-1">
                      <div className="flex-0 bg-purple-600 px-2 py-1 rounded-l-md">Notes</div>
                      <input
                        className="bg-gray-600 px-2 py-1 rounded-r-md border-b border-purple-500 flex-1 overflow-ellipsis h-full max-w-full flex justify-center items-center"
                        placeholder="Notes..."
                        value={w.notes}
                        onChange={(e) =>
                          setPastGiveaways((p) => {
                            const giveawayIdxToChange = p.findIndex((i) => i.createdAt === giveaway.createdAt)
                            if (giveawayIdxToChange === -1) return p
                            const winnerIdxToChange = p[giveawayIdxToChange].winners.findIndex(
                              (gw) => gw.login === w.login
                            )
                            if (winnerIdxToChange === -1) return p
                            const clone = JSON.parse(JSON.stringify(p))
                            clone[giveawayIdxToChange].winners[winnerIdxToChange].notes = e.target.value
                            return clone
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="border-b border-purple-600 mb-2">Stats</div>
            <div className="grid grid-cols-5 gap-2 px-2">
              <SettingItem label="Users" value={giveaway.giveawayStats?.users ?? '?'} />
              <SettingItem label="Entries" value={giveaway.giveawayStats?.entries ?? '?'} />
              <SettingItem label="Followers" value={giveaway.giveawayStats?.followers ?? '?'} />
              <SettingItem label="Subs" value={giveaway.giveawayStats?.subs ?? '?'} />
              <SettingItem label="Final Entries" value={giveaway.giveawayStats?.finalEntries ?? '?'} />
            </div>
          </div>
          <div>
            <div className="border-b border-purple-600 mb-2">Settings</div>
            <div className="grid grid-cols-4 gap-2 px-2">
              <SettingItem label="Sub Luck" value={giveaway.settings.subLuck.toString()} />
              <SettingItem label="# Winners" value={giveaway.settings.numberOfWinners.toString()} />
              <SettingItem label="Followers Only" value={giveaway.settings.followersOnly} />
              <SettingItem label="Send Messages" value={giveaway.settings.sendMessages} />
              <div className="grid col-span-4">
                <SettingItem
                  label="Chat Command"
                  value={giveaway.settings.chatCommand.toString().trim() || 'No command'}
                />
              </div>
              <div className="grid col-span-4">
                <SettingItem label="Winner Message" value={giveaway.settings.winnerMessage.toString()} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
