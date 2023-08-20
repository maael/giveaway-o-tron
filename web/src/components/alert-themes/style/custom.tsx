/* eslint-disable @next/next/no-img-element */
import * as React from 'react'

export default function CustomAlert({
  winner,
  imageUrl,
  visible,
}: {
  imageUrl?: string
  winner: string
  visible: boolean
}) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        visible ? 'animate-in fade-in' : 'animate-out fade-out'
      }`}
    >
      <img src={imageUrl} />
      <div className="text-4xl mt-5 uppercase text-white font-bold">{winner} won!</div>
    </div>
  )
}
