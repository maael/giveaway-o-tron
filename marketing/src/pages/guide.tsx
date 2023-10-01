import ChatTester from '~/components/marketing/ChatTester'
import Header from '~/components/marketing/Header'
import { btnClass } from '~/styling'

export default function Guide({ fathom }: { fathom: any }) {
  return (
    <>
      <Header fathom={fathom} />
      <div className="py-2 flex flex-col gap-8 justify-center items-center mx-auto text-center -mt-20 max-w-xl">
        <h1 className="text-6xl font-bold mb-4">Guide</h1>
        <div className="flex flex-row gap-4 justify-center items-center">
          <a href="#setup" className={btnClass}>
            Setup
          </a>
          <a href="#faq" className={`${btnClass} bg-opacity-50`}>
            FAQ
          </a>
        </div>
        <h2 className="text-5xl font-bold mb-4">Setup</h2>
        <ol className="text-left list-decimal gap-2 flex flex-col">
          <li>
            Download the <b>giveaway-o-tron.zip</b> file of the latest release from
            <a
              className="ml-2 font-bold text-white bg-purple-500 rounded-md px-2"
              href="https://github.com/maael/giveaway-o-tron/releases/latest"
            >
              here →
            </a>
          </li>
          <li>Unzip the folder</li>
          <li>
            Run the <b>giveaway-o-tron.exe</b> file in the folder
          </li>
          <li>It will show you the setup page, click on the link to direct to Twitch to get the required tokens</li>
          <li>Copy and paste the tokens to the app, and hit the button</li>
          <li>You should now see your chat!</li>
          <li>
            Before doing giveaways or using on stream, you'll need to let it collect your initial followers and
            subscribers - it'll let you know how it's doing with messages in the bottom right of the app
          </li>
          <li>
            Once you see a message saying two green ticks next to the progress bars at the bottom of your screen, you're
            good to go!
          </li>
        </ol>
        <h2 className="text-5xl font-bold mb-4">FAQ</h2>
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-bold">Command Tester</h3>
          <p>You can use this tool to test how different commands are matched against different chat messages.</p>
          <p>
            Add messages, and change the command, if they'll match will be automatically shown as you change the
            command.
          </p>
          <p>No command means anything matches!</p>
          <ChatTester />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-bold">What special chat commands are available?</h3>
          <p>
            Put these directly as they appear here into the chat command setting field, including any $ symbols etc.
          </p>

          <h4 className="text-purple-600 bg-gray-900 font-bold py-1 mt-2">$gw2_account$</h4>

          <p>
            This will require viewer to put in their Guild Wars 2 account names in the format matching <b>Test.1234</b>{' '}
            - it handles names with spaces too
          </p>

          <h5 className="text-xl font-bold mt-2">Does it handle names with spaces in?</h5>

          <p>
            Yup, it sure does! For names with spaces in, the last part will match, and the whole message will be shown.
            For example, <b>Name With Spaces.1234</b> will match with <b>Spaces.1234</b> - but the whole message will be
            shown if selected as a winner.
          </p>

          <h4 className="text-purple-600 bg-gray-900 font-bold py-1 mt-2">$steam_friend$</h4>

          <p>
            This will require viewer to put in their 8-digit Steam Friend Code <b>12345678</b>.
          </p>

          <h4 className="text-purple-600 bg-gray-900 font-bold py-1 mt-2">$gw2_or_steam$</h4>

          <p>
            This will match either the <b>$gw2_account$</b> or <b>$steam_friend$</b> chat commands above
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-bold">How does the Spam Limit option work?</h3>
          <p>
            The Spam Limit only affects Active Chatter giveaways. When doing the giveaway, every user will have how many
            times they entered counted. If this count exceeds the set spam limit, they will be removed from the draw
            before choosing winners. The goal of the spam limit is to reduce chat spam and catch bots spamming blindly.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-bold">Where do my Twitch details get saved?</h3>
          <p>
            Your Twitch details are only saved locally, in the folder with <b>giveaway-o-tron.exe</b>. They are never
            sent anywhere, besides to authenticate with the Twitch API. They are never stored anywhere besides locally
            on your PC.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-bold">OBS Alerts</h3>
          <p>
            At the top of the app, one of the buttons has the OBS icon, which will take you to the OBS Settings page.
          </p>

          <p>Here you can copy your specific URL for the two available alert types, which are:</p>

          <h4 className="text-purple-600 bg-gray-900 font-bold py-1 mt-2">Winner Alert</h4>

          <p>
            This alert will show the winners name in a brief alert. You can control how long the alert stays visible for
            with the <b>Duration</b> setting on the OBS Settings page.
          </p>

          <h4 className="text-purple-600 bg-gray-900 font-bold py-1 mt-2">Giveaway Status Alert</h4>

          <p>
            This alert will automatically show giveaway status, based on the Chat Command entered on the main screen,
            and the status of the Timer tool also on the main screen.
          </p>

          <p>
            When the Timer is started, the alert will change to display a message stating that the giveaway is open, as
            well as any chat command required (including descriptions of any special commands used).
          </p>

          <p>
            When the Timer finishes, it will automatically update the alert to say that the giveaway has been closed.
          </p>

          <p>Cancelling the Timer will remove the alert.</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-bold">Discord Bot</h3>
          <h4 className="text-3xl font-bold mt-1">Inviting and Setup</h4>

          <p>
            At the top of the app, one of the buttons has the Discord icon, which will take you to the Discord Settings
            page.
          </p>

          <p>In the top right of this page is a button which will take you to invite the bot to an available server.</p>

          <p>
            Once the bot is invited, before it can post anything, it needs to know where you want it to send messages,
            and so you must enter the <b>Server ID</b> and <b>Channel ID</b>.
          </p>

          <p>To get these:</p>

          <ol className="text-left list-decimal gap-2 flex flex-col">
            <li>In Discord, go to settings</li>
            <li>Go to Appearance, Advanced, and enable Developer Mode</li>
            <li>Right click on your Discord Server icon in the sidebar, and select Copy ID, and paste above</li>
            <li>Do the same again but for a channel</li>
          </ol>

          <h4 className="text-3xl font-bold mt-1">Configuration</h4>

          <p>
            Once the bot has been invited, and configured with the required IDs, it will post the default messages for
            winners and giveaways starting and ending.
          </p>

          <p>
            You can control these on the Discord Settings page, by setting the Title and Body for each type
            independently. You can also enable/disable each message, by ticking or unticking the checkbox to the right
            of the other details.
          </p>

          <p>
            You can use special keywords in the title and body messages to enter things like the winners name - for more
            details see in the app itself.
          </p>

          <p>
            Mentions like <b>@role</b> will work in the message body as well and correctly notify Discord members with
            the specified role.
          </p>

          <p>
            One useful setting you can also find on the Discord Settings page is
            <b>Giveaway Alert Min Time</b>. This interacts with the Timer tool on the main page. The{' '}
            <b>Giveaway Start</b> and <b>Giveaway End</b> messages will only be sent if the Timer duration exceeds the{' '}
            <b>Giveaway Alert Min Time</b>. This can be useful for only notifying your Discord for longer entry
            giveaways, and not the brief 2 minute flash entry giveaways.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-bold">Something isn't working</h3>
          <p>
            First off, open <b>Giveaway-o-tron</b>, and go to the Settings page by clicking on the cog icon.
          </p>

          <p>At the bottom of the Settings page, there are two red buttons.</p>

          <p>
            To begin with, click the <b>Sign Out Token Tool</b>. This will cause new Twitch tokens to be reissued, and
            available for you to copy.
          </p>

          <p>
            Then, click on the <b>Reset Channel Info</b> button back in the app. This will take you back to the Setup
            screen, where you can enter the new tokens.
          </p>

          <p>This should fix most issues.</p>

          <p>
            If it does not, please let me know by opening an issue
            <a href="https://github.com/maael/giveaway-o-tron/issues/new">here</a> so it can be investigated.
          </p>
        </div>
      </div>
    </>
  )
}
