import * as React from 'react'
import dynamic from 'next/dynamic'

const GiveawayEntry = dynamic(() => import('~/components/giveaway-entry'), {
  ssr: false,
  loading: () => null,
})

export default function Test() {
  return (
    <div>
      <GiveawayEntry />
    </div>
  )
}
