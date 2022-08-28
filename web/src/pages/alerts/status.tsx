import * as React from 'react'
import dynamic from 'next/dynamic'

const GiveawayStatus = dynamic(() => import('~/components/giveaway-status'), {
  ssr: false,
  loading: () => null,
})

export default function Test() {
  return (
    <div>
      <GiveawayStatus />
    </div>
  )
}
