import * as React from 'react'
import dynamic from 'next/dynamic'

const GW2Alerts = dynamic(() => import('~/components/alert-themes/gw2'), {
  ssr: false,
  loading: () => null,
})

export default function Test() {
  return (
    <div>
      <GW2Alerts />
    </div>
  )
}
