import { FaScroll, FaTimes } from 'react-icons/fa'
import useStorage from '../hooks/useStorage'
import cls from 'classnames'
import isBefore from 'date-fns/isBefore'
import { useMemo, useState } from 'react'
import { Modal, useModal } from '../hooks/useModal'

export default function Changelog() {
  const [loaded, setLoaded] = useState(false)
  const [lastChangelog, setLastChangelog] = useStorage<null | string>('last-changelog', null, () => {
    setLoaded(true)
  })
  const hasNewChangelog = useMemo(
    () => (loaded ? (!lastChangelog ? true : isBefore(new Date(), new Date(lastChangelog))) : false),
    [lastChangelog, loaded]
  )
  const { close, open, isOpen } = useModal()
  return (
    <>
      <button
        onClick={() => {
          setLastChangelog(new Date().toISOString())
          open()
        }}
        title="Changelog"
        className={cls('px-3 flex justify-center items-center rounded-md text-xs gap-1 hover:opacity-100', {
          'bg-yellow-600': hasNewChangelog,
          'bg-purple-600 opacity-60': !hasNewChangelog,
        })}
      >
        <FaScroll /> {hasNewChangelog ? 'New Changes' : ''}
      </button>
      <Modal isOpen={isOpen} close={close}>
        <button className="absolute top-2 right-2 text-xl opacity-60 hover:opacity-100" onClick={close}>
          <FaTimes />
        </button>
        <div className="flex flex-col gap-3 pb-2">
          <h1 className="text-2xl uppercase flex gap-2 items-center">
            <FaScroll /> Changelog
          </h1>
          <ChangelogEntry
            title="June 9th, 2024"
            items={['Add changelog', 'Added Guild Wars 2 Janthir theme under OBS settings panel']}
          />
        </div>
      </Modal>
    </>
  )
}

function ChangelogEntry({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-0.5 px-2">
      <h2>{title}</h2>
      <ul className="list-outside list-disc pl-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
