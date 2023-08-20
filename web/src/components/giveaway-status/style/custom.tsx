/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { StatusProps } from './shared'

export default function CustomStatus({ status, title, body, imageUrl }: StatusProps) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both text-white font-bold text-center ${
        status ? (status === 'start' ? 'animate-in fade-in' : '') : 'animate-out fade-out'
      }`}
    >
      {imageUrl ? <img src={imageUrl} className="h-72" /> : null}
      <div className="text-5xl my-3">{title}</div>
      <div className="text-4xl">{body}</div>
    </div>
  )
}
