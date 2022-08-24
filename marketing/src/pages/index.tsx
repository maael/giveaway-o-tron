import Image from 'next/image'
import * as React from 'react'
import { FaDownload, FaGithub, FaIceCream, FaRobot } from 'react-icons/fa'

export default function Index() {
  return (
    <div className="flex flex-col gap-5 px-10 lg:px-3 mx-auto max-w-5xl pt-3 pb-20 h-full">
      <div className="flex justify-between items-center pb-20">
        <h1 className="flex flex-row justify-center items-center gap-2 bg-purple-600 px-3 py-1 rounded-md text-xl shadow-md">
          <FaRobot /> Giveaway-o-tron
        </h1>
        <div className="flex flex-row gap-2">
          <a className="button" href="https://github.com/maael/giveaway-o-tron/releases/latest">
            <FaDownload /> Download
          </a>
          <a className="button text-2xl px-4" href="https://github.com/maael/giveaway-o-tron">
            <FaGithub />
          </a>
        </div>
      </div>
      <div>
        <div className="w-2/3 md:w-1/2- relative aspect-video mx-auto">
          <Image src="/images/screenshot.png" className="shadow-lg" layout="fill" />
        </div>
      </div>
      <div className="py-10 flex flex-col gap-8 justify-center items-center max-w-md mx-auto text-center -mt-12">
        <h2 className="text-4xl font-bold">The Twitch giveaway app that does it all</h2>
        <p className="text-lg opacity-80">Hey</p>
        <div className="flex flex-row gap-4 justify-center items-center">
          <a className="button">Get Started</a>
          <a className="button bg-opacity-50">Learn More</a>
        </div>
      </div>
      <div className="py-10 flex flex-col gap-4 justify-center items-center max-w-md mx-auto text-center">
        <h2 className="text-4xl font-bold">Main Features</h2>
        <p className="text-lg opacity-80">Hey</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 px-20 -mt-5">
        <Feature />
        <Feature />
        <Feature />
        <Feature />
        <Feature />
      </div>
      <div className="py-10 flex flex-col gap-4 justify-center items-center max-w-md mx-auto text-center">
        <h2 className="text-4xl font-bold">The Test Run</h2>
        <p className="text-lg opacity-80">Hey</p>
      </div>
      <div className="w-2/3 md:w-1/2- relative aspect-video mx-auto">
        <Image src="/images/screenshot.png" className="shadow-lg" layout="fill" />
      </div>
    </div>
  )
}

function Feature() {
  return (
    <div className="flex justify-center flex-col gap-3 items-start">
      <div className="bg-purple-600 p-3 flex justify-center items-center rounded-md shadow-md">
        <FaIceCream />
      </div>
      <h3 className="font-bold">Title</h3>
      <p className="opacity-80">Details of it and lots of details that just keep on going</p>
    </div>
  )
}
