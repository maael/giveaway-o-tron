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
      authorization: {
        params: {
          scope:
            'openid user:read:email user:read:subscriptions chat:read chat:edit channel:read:subscriptions channel_subscriptions',
          claims: {
            id_token: {
              email: null,
              picture: null,
              preferred_username: null,
            },
          },
        },
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
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(session as any).accessToken = token.accessToken
      ;(session as any).refreshToken = token.refreshToken
      return session
    },
  },
})
