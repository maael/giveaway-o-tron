/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import Countdown, { zeroPad } from 'react-countdown'
import { StatusProps, SPECIAL_COMMAND_TEXT } from './shared'

const countDownRenderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a complete state
    return <div className="animate-pulse cagfont">Giveaway closed!</div>
  } else {
    // Render a countdown
    return (
      <span>
        {zeroPad(hours, 2)} : {zeroPad(minutes, 2)} : {zeroPad(seconds, 2)}
      </span>
    )
  }
}

const StableCountdown = React.memo(function StableCountdown({ value }: { value: number }) {
  return <Countdown renderer={countDownRenderer} date={value} />
})

export default function Gw2Status({
  status,
  title,
  goalTs,
  body,
  command,
  followersOnly,
  alertType,
}: StatusProps & { alertType?: string }) {
  return (
    <div
      className={`flex flex-col justify-center items-center bg-transparent relative fill-mode-both ${
        status ? (status === 'start' ? 'animate-slowwiggle' : '') : 'animate-out fade-out'
      }`}
    >
      <img src={`/images/${alertType || 'gw2'}/notification.png`} />
      {status === 'start' && goalTs && alertType === 'gw2-soto' ? null : (
        <div
          className={`text-white uppercasetext-bold left-2 right-2 text-center absolute uppercase gwfont ${
            goalTs ? 'text-2xl' : followersOnly ? 'text-2xl' : 'text-3xl'
          }`}
          style={{
            top: goalTs
              ? alertType === 'gw2'
                ? 225
                : 230
              : alertType === 'gw2' || alertType === 'gw2-soto'
              ? 238
              : 245,
          }}
        >
          {title}
        </div>
      )}
      {goalTs ? (
        <div
          className={`text-white uppercasetext-bold left-2 right-2 text-center absolute uppercase cagfont drop-shadow-lg ${
            alertType === 'gw2-soto' ? 'text-3xl' : followersOnly ? 'text-xl' : 'text-xl'
          }`}
          style={{ top: alertType === 'gw2-soto' ? 240 : alertType === 'gw2' ? 252 : 257 }}
        >
          <StableCountdown value={Number(goalTs)} />
        </div>
      ) : null}
      <div
        className={`text-white uppercase px-4 py-2 text-bold text-center absolute cagfont ${
          status !== 'ended' && command && Object.keys(SPECIAL_COMMAND_TEXT).some((k) => command.includes(k))
            ? 'text-lg'
            : status === 'ended'
            ? 'text-4xl'
            : 'text-2xl'
        }`}
        style={{ top: 285, width: 360 }}
      >
        {body}
      </div>
    </div>
  )
}
