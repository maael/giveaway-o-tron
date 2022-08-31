import Link from 'next/link'
import * as React from 'react'
import { FaDownload, FaGithub, FaRobot } from 'react-icons/fa'
import * as Fathom from 'fathom-client'

export default function Header({ fathom }: { fathom: typeof Fathom }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-20">
      <Link href="/">
        <h1 className="flex flex-row justify-center items-center gap-2 bg-purple-600 px-3 py-1 rounded-md text-2xl shadow-md cursor-pointer">
          <FaRobot /> Giveaway-o-tron
        </h1>
      </Link>
      <div className="flex flex-row gap-2">
        <a
          className="button"
          href="https://github.com/maael/giveaway-o-tron/releases/latest/download/giveaway-o-tron.zip"
          onClick={() => fathom.trackGoal('YTV1LXUB', 0)}
        >
          <FaDownload /> Download
        </a>
        <a className="button text-2xl px-4" href="https://github.com/maael/giveaway-o-tron">
          <FaGithub />
        </a>
      </div>
    </div>
  )
}
