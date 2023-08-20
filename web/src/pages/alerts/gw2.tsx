import * as React from 'react'
import dynamic from 'next/dynamic'

const Alerts = dynamic(() => import('~/components/alert-themes'), {
  ssr: false,
  loading: () => null,
})

export default function Test() {
  return (
    <div>
      <Alerts />
    </div>
  )
}
