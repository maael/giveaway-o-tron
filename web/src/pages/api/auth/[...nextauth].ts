import NextAuth from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_ID || '',
      clientSecret: process.env.TWITCH_SECRET || '',
    }),
    // ...add more providers here
  ],
})
