import Header from '~/components/primitives/Header'

export default function Guide({ fathom }) {
  return (
    <>
      <Header fathom={fathom} />
      <div className="py-2 flex flex-col gap-8 justify-center items-center mx-auto text-center -mt-20">
        <h1 className="text-6xl font-bold">Guide</h1>
        <div className="flex flex-row gap-4 justify-center items-center">
          <a href="#setup" className="button">
            Setup
          </a>
          <a href="#faq" className="button bg-opacity-50">
            FAQ
          </a>
        </div>
        <a id="setup">
          <h2 className="text-5xl font-bold">Setup</h2>
        </a>
        <ol className="text-left flex flex-col gap-2 mt-5 list-decimal max-w-2xl mx-auto px-2">
          <li>
            Download the{' '}
            <em className="text-purple-600 font-bold bg-gray-900 px-3 py-1 mx-1 rounded-md not-italic">
              giveaway-o-tron.zip
            </em>{' '}
            file of the latest release from{' '}
            <a
              href="https://github.com/maael/giveaway-o-tron/releases/latest"
              onClick={() => fathom.trackGoal('YTV1LXUB', 0)}
            >
              here
            </a>
          </li>
          <li>Unzip the folder</li>
          <li>
            Run the{' '}
            <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic">
              giveaway-o-tron.exe
            </em>{' '}
            file in the folder
          </li>
          <li>It will show you the setup page, click on the link to direct to Twitch to get the required tokens</li>
          <li>Copy and paste the tokens to the app, and hit the button</li>
          <li>You should now see your chat!</li>
          <li>
            Before doing giveaways or using on stream, you'll need to let it collect your initial followers and
            subscribers - it'll let you know how it's doing with messages in the bottom right of the app
          </li>
          <li>
            Once you see a message saying{' '}
            <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic">Done</em> you're good
            to go!
          </li>
        </ol>
        <a id="faq">
          <h2 className="text-5xl font-bold">FAQ</h2>
        </a>
        <h3 className="text-3xl font-bold">What are the available special commands?</h3>
        <p className="opacity-80 text-center max-w-xl -mt-6">
          Put these directly as they appear here into the chat command setting field, including any $ symbols etc.
        </p>
        <div className="text-left flex flex-col gap-2 list-disc max-w-2xl mx-auto px-2 -mt-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col items-start">
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic text-xl">
                $gw2_account$
              </em>
            </div>
            <div>
              This will require viewer to put in their Guild Wars 2 account names in the format matching{' '}
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic">Test.1234</em> - it
              handles names with spaces too
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col items-start">
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic text-xl">
                $steam_friend$
              </em>
            </div>
            <div>
              This will require viewer to put in their 8-digit Steam Friend Code in the format matching{' '}
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic">12345678</em>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col items-start">
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic text-xl">
                $gw2_or_steam$
              </em>
            </div>
            <div>
              This will match either the{' '}
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic">$gw2_account$</em>{' '}
              or{' '}
              <em className="text-purple-600 font-bold bg-gray-900 px-2 py-1 rounded-md not-italic">$steam_friend$</em>{' '}
              chat commands above
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold">More to come</h3>
      </div>
    </>
  )
}
