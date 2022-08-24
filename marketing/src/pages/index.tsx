import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { IconType } from 'react-icons'
import {
  FaClock,
  FaDice,
  FaExclamation,
  FaGifts,
  FaHammer,
  FaHeart,
  FaICursor,
  FaList,
  FaQuoteLeft,
  FaSadTear,
} from 'react-icons/fa'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import Header from '~/components/primitives/Header'

const TwitchPlayer = dynamic(() => import('react-twitch-embed-video'), {
  ssr: false,
})

export default function Index({ fathom }) {
  return (
    <>
      <Header fathom={fathom} />
      <div>
        <div className="w-full md:w-2/3 relative aspect-video mx-auto shadow-[0_3px_40px_5px_rgba(0,0,0,0.3)] shadow-purple-600 -mt-8 md:mt-0">
          <Image src="/images/screenshot.png" className="shadow-lg" layout="fill" />
        </div>
      </div>
      <div className="py-10 flex flex-col gap-8 justify-center items-center mx-auto text-center -mt-6 -mb-6">
        <h2 className="text-4xl font-bold">Introducing Giveaway-o-tron!</h2>
        <h2 className="text-4xl font-bold">A brand new Twitch giveaway app</h2>
        <p className="text-lg opacity-80 max-w-md ">
          Take back control of your giveaways, the app runs locally, with all the features you could want, and a healthy
          dose of reliablility on top
        </p>
        <div className="flex flex-row gap-4 justify-center items-center">
          <Link href="/guide">
            <a className="button">Get Started</a>
          </Link>
          <a href="#mainfeatures" className="button bg-opacity-50">
            Learn More
          </a>
        </div>
      </div>
      <div className="py-10 flex flex-col gap-4 justify-center items-center max-w-md mx-auto text-center">
        <a id="mainfeatures">
          <h2 className="text-4xl font-bold">Main Features</h2>
        </a>
        <p className="text-lg opacity-80">Jam-packed with all the features you could want for a giveaway!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 px-2 md:px-20 -mt-5 items-start mb-2">
        <Feature title="Multiple giveaway styles" Icon={FaGifts}>
          Choose between including your lurkers, or requiring chat participation.
        </Feature>
        <Feature title="Follower only mode" Icon={FaHeart}>
          Incentivise your viewers to hit the follow button, limit your giveaways to followers only.
        </Feature>
        <Feature title="Subscriber luck" Icon={FaDice}>
          Reward your subscribers with extra places in the giveaway.
        </Feature>
        <Feature title="Integrated chat" Icon={FaQuoteLeft}>
          Easily view and search your chat, automatically limiting chat to winners of giveaways to see their replies.
        </Feature>
        <Feature title="OBS alert" Icon={FaExclamation}>
          Integrates with your other streaming software to make your life a bit easier, automatically showing winners.
        </Feature>
        <Feature title="Giveaway timer" Icon={FaClock}>
          Focus on the stream, not the time. Set a time for entry and leave it - the chat entries will be locked
          automatically.
        </Feature>
        <Feature title="Flexible chat command" Icon={FaICursor}>
          Match commands anywhere in a message, with or without a ! - there's even some magic special commands like
          account names.
        </Feature>
        <Feature title="Spam limit" Icon={FaList}>
          Want to try to control your chat a bit more in giveaways? How about automatically removing viewers who spam
          the entry command.
        </Feature>
        <Feature title="Forfeit command" Icon={FaSadTear}>
          Speaking of control - if your chat is spamming an old command, take them out of the giveaway pool (until you
          let them back in).
        </Feature>
        <Feature title="Blocklist" Icon={FaHammer}>
          You find all sorts on Twitch. This is one more tool to help with the less good sorts (and bots).
        </Feature>
      </div>
      <div className="pt-5 flex flex-col gap-4 justify-center items-center mx-auto text-center -mb-1">
        <h2 className="text-4xl font-bold">The Origin Story</h2>
        <p className="text-lg opacity-80">The tweet that sparked this tool</p>
      </div>
      <TwitterTweetEmbed tweetId="1559959019619581952" options={{ align: 'center', theme: 'dark' }} />
      <div className="py-3 flex flex-col gap-4 justify-center items-center max-w-md mx-auto text-center -mb-1">
        <h2 className="text-4xl font-bold">The Test Run</h2>
        <p className="text-lg opacity-80">
          Some examples from early on in the tool development, including one of the magic commands, a Guild Wars 2
          account name command, and a giveaway showing the chat limiting to winners only
        </p>
      </div>
      <PlayerWrapper video="1567875737" time="0h38m10s" />
      <PlayerWrapper video="1570309446" time="2h31m08s" />
    </>
  )
}

function PlayerWrapper({ video, time }: { video: string; time: string }) {
  const divRef = React.useRef<null | HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ height: 0, width: 0 })
  React.useLayoutEffect(() => {
    if (divRef.current) {
      setDimensions({ height: divRef.current.clientHeight, width: divRef.current.clientWidth })
    }
  }, [])
  return (
    <div ref={divRef} className="w-full md:w-2/3 aspect-video my-2 mx-auto relative">
      <TwitchPlayer
        video={video}
        time={time}
        autoplay={false}
        width={dimensions.width}
        height={dimensions.height}
        theme="dark"
        targetClass="w-full h-full"
        targetId={video}
      />
    </div>
  )
}

function Feature({ title, Icon, children }: React.PropsWithChildren<{ title: string; Icon: IconType }>) {
  return (
    <div className="flex justify-center flex-col gap-3 items-start">
      <div className="bg-purple-600 p-3 flex justify-center items-center rounded-md shadow-md">
        <Icon />
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="opacity-80">{children}</p>
    </div>
  )
}
