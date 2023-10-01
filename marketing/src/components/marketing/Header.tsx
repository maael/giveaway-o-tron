import Link from 'next/link'
import { FaDoorOpen, FaGithub, FaRobot } from 'react-icons/fa'
import { btnClass } from '~/styling'

export default function Header({ fathom }: { fathom: any }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-20">
      <Link href="/">
        <h1 className="flex flex-row justify-center items-center gap-2 bg-purple-600 px-3 py-1 rounded-md text-2xl shadow-md cursor-pointer">
          <FaRobot /> Giveaway-o-tron
        </h1>
      </Link>
      <div className="flex flex-row gap-2">
        <Link className={btnClass} href="/app" onClick={() => fathom.trackGoal('TNUCDFRF', 0)} prefetch={false}>
          <FaDoorOpen /> Login
        </Link>
        <a className={`${btnClass} text-2xl px-4`} href="https://github.com/maael/giveaway-o-tron">
          <FaGithub />
        </a>
      </div>
    </div>
  )
}
