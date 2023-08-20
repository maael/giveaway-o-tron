/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { AutoTextSize } from 'auto-text-size'

export default function Gw2StyleAlert({
  winner,
  visible,
  type: alertType,
}: {
  winner: string
  visible: boolean
  type: string
}) {
  const winnerParts = winner.split('|$$|')
  const winnerName = winnerParts[0]
  const type = (winnerParts[1] || 'winner').toLowerCase()
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        visible ? 'animate-wiggle' : 'animate-out fade-out'
      }`}
    >
      <img src={`/images/${alertType || 'gw2'}/notification.png`} />
      <div
        className="text-white text-4xl uppercasetext-bold left-0 right-0 text-center absolute gwfont"
        style={{ top: alertType === 'gw2' || alertType === 'gw2-aurene' ? 232 : 240 }}
      >
        {alertType === 'gw2-soto' ? '' : type === 'blocked' ? 'Blocked!' : type === 'rigged' ? 'Rigged!' : 'Winner!'}
      </div>
      <div>
        <div
          className="text-white uppercase px-4 py-2 text-bold text-center absolute mx-auto items-center-important cagfont"
          style={{ top: 292, left: 50, right: 50, width: 450, height: 50 }}
        >
          <AutoTextSize maxFontSizePx={50}>
            <p className="mx-auto my-auto">{winnerName}</p>
          </AutoTextSize>
        </div>
        <div
          className="text-white text-4xl uppercase px-4 py-2 text-bold text-center absolute mx-auto cagfont"
          style={{ top: 340, left: 50, right: 50, width: 450, height: 50 }}
        >
          {type === 'blocked' ? 'blocked!' : type === 'rigged' ? 'won! Totally not rigged.' : 'won!'}
        </div>
      </div>
    </div>
  )
}
