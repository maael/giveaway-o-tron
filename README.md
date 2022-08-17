# Giveaway-o-tron

Windows program to allow Twitch giveaways with multiple options.

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

## Todo

- [ ] Sub luck
- [ ] Follower limitation
- [ ] Get Twitch User token
- [ ] Pause/Resume chat
- [ ] Clear
- [ ] Send message to chat on winner

### Sub Luck

- For active chat/commands - we can get from IRC message badge
- For viewers - we need to:
  - Get if viewers are subscribers
  - Double viewers who are subscribers

### Follower Limitation

- Just roll the dice, and check if sub
  - If they aren't, roll again
  - If they are, we're good

### Get Twitch User token

- Small Vercel service to do Twitch Oauth and show the token + easy copy to clipboard
- Link to that from the app when setting up
- Save it to the local storage file
- Refresh token (if possible)
