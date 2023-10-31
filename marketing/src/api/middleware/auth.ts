import createHandler, { expressWrapper } from '~/api/middleware/handler'
import passport from '~/api/passport'
import session from '~/api/session'
import { FullNextApiRequest } from '~/api/types'

const auth = createHandler()
  .use(
    expressWrapper(
      session({
        name: 'sess1',
        secret: process.env.TOKEN_SECRET,
        cookie: {
          maxAge: 60 * 60 * 8, // 8 hours,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'lax',
        },
      })
    )
  )
  .use((req: FullNextApiRequest, res, next) => {
    // Initialize mocked database
    // Remove this after you add your own database
    req.session.users = req.session.users || []
    next()
  })
  .use(expressWrapper(passport.initialize()))
  .use(expressWrapper(passport.session()))

export default auth
