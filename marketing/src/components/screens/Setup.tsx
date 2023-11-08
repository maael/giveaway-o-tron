import React from 'react'
import { useHistory } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa'
import { ChannelInfo } from '../../utils'

export default function Setup({ channel }: { channel: ChannelInfo }) {
  const history = useHistory()
  React.useEffect(() => {
    if (channel.login) {
      history.push('/')
    }
  }, [channel.login])
  return (
    <div className="flex flex-col justify-center items-center h-full gap-3 -mt-10">
      <div className="text-3xl">Setting up Giveaway-o-tron</div>
      <FaSpinner className="animate animate-spin text-5xl" />
      <p>Checking Twitch details...</p>
      <p>If needed, will ask for Twitch authorisation</p>
    </div>
  )
}
