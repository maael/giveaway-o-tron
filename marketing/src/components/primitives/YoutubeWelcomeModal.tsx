import { useEffect } from 'react'
import { Modal, useModal } from '../hooks/useModal'
import { useBeta } from '../hooks/useBeta'

const STORAGE_KEY = 'giveaway-youtube-welcome-v1'

export default function YoutubeWelcomeModal() {
  const { close, open, isOpen } = useModal()
  const inBeta = useBeta()
  useEffect(() => {
    if (inBeta && !localStorage.getItem(STORAGE_KEY)) {
      open()
    }
  }, [inBeta])
  return (
    <Modal isOpen={isOpen} close={close}>
      <h1 className="text-lg font-bold text-purple-600">Welcome to the YouTube Beta!</h1>
      <h2 className="font-bold">Version: 1.0 (2023-11-08)</h2>
      <p>Make sure your email has been provided to maael on Discord.</p>
      <p>
        To start using YouTube - connect with your Google account with the email via the YouTube button in the top
        right.
      </p>
      <p>
        Once connected, ensure that a message with "Found YouTube Broadcast" has appeared at the bottom of the screen.
      </p>
      <p>To test the connection, press the YouTube button at the top left of the chat box to get some chat messages.</p>
      <p>
        Unfortunately due to YouTube limitations, chat messages will only be collected and appear while a giveaway is
        active.
      </p>
      <p>
        If there are any issues, please log out (press one of the buttons in the top right), and log back in and connect
        YouTube again.
      </p>
      <p>If issues persist, please tell maael on Discord.</p>
      <div className="flex flex-row gap-2 justify-between mt-5">
        <button
          className="bg-purple-600 px-2 py-1 flex-1 select-none cursor-pointer gap-1 transition-colors hover:bg-purple-700 rounded-md drop-shadow-lg"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, 'true')
            close()
          }}
        >
          Continue
        </button>
      </div>
    </Modal>
  )
}
