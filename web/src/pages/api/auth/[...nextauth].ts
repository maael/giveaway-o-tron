import NextAuth from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_ID || '',
      clientSecret: process.env.TWITCH_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account?.access_token
        token.refreshToken = account?.refresh_token
      }
      return token
    },
    async session({ session, token, user: _user }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      return session
    },
  },
})
