import React from 'react'
import { Settings } from '~/utils'

interface GiveawayData {
  id: string
  createdAt: string
  type: string
  settings: Omit<Settings, 'autoConnect'>
  winners: { login: string; isSubscriber: boolean; follows: boolean }[]
}

const GIVEAWAYS: GiveawayData[] = [
  {
    id: '1',
    createdAt: new Date().toISOString(),
    type: 'Instant Viewer Giveaway',
    settings: {
      followersOnly: true,
      numberOfWinners: 2,
      chatCommand: '',
      sendMessages: false,
      winnerMessage: 'PartyHat Yes',
      subLuck: 1,
    },
    winners: [
      {
        login: 'Test User',
        isSubscriber: false,
        follows: true,
      },
      {
        login: 'Test User',
        isSubscriber: false,
        follows: true,
      },
    ],
  },
  {
    id: '2',
    createdAt: new Date().toISOString(),
    type: 'Active Chatter Giveaway',
    settings: {
      followersOnly: true,
      numberOfWinners: 2,
      chatCommand: '',
      sendMessages: false,
      winnerMessage: 'PartyHat Yes',
      subLuck: 1,
    },
    winners: [
      {
        login: 'Test User',
        isSubscriber: false,
        follows: true,
      },
      {
        login: 'Test User',
        isSubscriber: false,
        follows: true,
      },
    ],
  },
]

export default function PastGiveaways() {
  return (
    <div>
      <div>Past Giveaways</div>
      {GIVEAWAYS.map((giveaway) => (
        <div id={giveaway.id}>{giveaway.type}</div>
      ))}
    </div>
  )
}
