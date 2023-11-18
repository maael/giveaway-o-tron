import passport from 'passport'
import { Strategy as TwitchStrategy } from 'passport-twitch-new'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { FullNextApiRequest } from '~/api/types'

passport.serializeUser(function (user, done) {
  // serialize the username into session
  try {
    done(null, user)
  } catch (e) {
    console.info('[passport]', 'Error serializing', e)
    done(null, null)
  }
})

passport.deserializeUser(function (_req, user, done) {
  done(null, user)
})

const twitchStragegy = new TwitchStrategy(
  {
    passReqToCallback: true,
    clientID: process.env.TWITCH_ID,
    clientSecret: process.env.TWITCH_SECRET,
    callbackURL: `${process.env.ROOT_URL}/api/auth/twitch/callback`,
    scope:
      'openid user:read:email user:read:follows user:read:subscriptions chat:read chat:edit channel:read:subscriptions channel_subscriptions moderator:read:followers',
  },
  async (req: FullNextApiRequest, accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        ...(req.user || {}),
        twitch: {
          provider: 'twitch',
          id: profile.id,
          username: profile.login,
          name: profile.display_name,
          image: profile.profile_image_url,
          accessToken,
          refreshToken,
        },
      }
      req.logIn(user, async (err) => {
        if (err) {
          console.error('[twitch:error]', err)
          throw new Error('Problem with auth')
        }
        done(null, user)
      })
    } catch (e) {
      console.error('e', e)
      done(null, null)
    }
  }
)

const googleStrategy = new GoogleStrategy(
  {
    passReqToCallback: true,
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.ROOT_URL}/api/auth/google/callback`,
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
      'openid',
      'profile',
    ],
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        ...(req.user || {}),
        youtube: {
          provider: 'youtube',
          id: profile.id,
          username: profile.displayName,
          name: profile.displayName,
          image: (profile.photos[0] || {}).value,
          accessToken,
          refreshToken,
        },
      }
      req.logIn(user, async (err) => {
        if (err) {
          console.error('[youtube:error]', err)
          throw new Error('Problem with auth')
        }
        done(null, user)
      })
    } catch (e) {
      console.error('e', e)
      done(null, null)
    }
  }
)

passport.use(twitchStragegy)
passport.use(googleStrategy)

export default passport
