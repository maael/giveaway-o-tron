import passport from '~/api/passport'
import createHandler from '~/api/middleware/handler'

const handler = createHandler()

handler.get((req, res) => {
  passport.authenticate(
    req.query.provider,
    req.query.provider === 'google' ? { accessType: 'offline', prompt: 'consent' } : undefined
  )(req, res)
})

export default handler.handler()
