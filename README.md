# Giveaway-o-tron

Windows program and a website to allow Twitch giveaways with multiple options.

## Features

- Two types of giveaways
  - Viewers Instant Giveaway - get a list of viewers and select one, even lurkers
  - Active Chatters Giveaway - selects a viewer who has actively chatted, optionally with a specific command included
- Custom winner message to be posted after the Giveaway
  - Embed the viewer's name with `@name` where you want it to appear
- Custom sub luck increases
- Do a draw of 1-10 winners at a time
- For chatters giveaways - set a time for the chat to be paused after, allowing you to cut off who can enter while you refine and do the giveaway

## Usage

Download the latest release from the [Releases page here](https://github.com/maael/giveaway-o-tron/releases).

Download the `giveaway-o-tron.zip`, unzip it, and run the `giveaway-o-tron.exe`.

You'll be asked to click a link to go to Twitch to authenticate to get a token.

> **Note**
> Giveaway-o-tron needs the Twitch token to be able to make requests to Twitch's API, and also to send bot messages for winners if you want to.

> **Warning**
> At the moment, viewer status changes (follower/subscribe statuses), won't be updated after the first time they're seen.
> This is an active trade-off for speed of the draw, but hopefully something we can mitigate with more time.

## Technical Features

- Includes both the "native" app (JS/TS with React in a Neutralino.js shell) and the web component (Next.js website hosted on Vercel)
- Heavy caching of the followers/subscribers
  - Goal is to speed up time of the draw for faster feedback
  - Starts caching as soon as the app is open, getting the current viewers list
    - For best impact, open the app pre-emptively to allow it to "pre-warm" the cache
  - Currently has an issue with status changes between when the user was first seen, and then subsequently seen

### Big Issues

- The caching/status update issue is a concern
  - Potentially can be solved by updating to EventSub Twitch API to update in a more evented way as new follows/subs, and unfollows/unsubs come in.

## Development

```sh
git clone git@github.com:maael/giveaway-o-tron.git
cd giveaway-o-tron
npm i
neu update
npm run dev
```

## Build

```sh
npm run build
```

This will make a `dist/giveaway-o-tron` directory, that can be zipped and distributed.
