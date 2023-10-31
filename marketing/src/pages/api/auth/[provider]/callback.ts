import auth from '~/api/middleware/auth'
import passport from '~/api/passport'

const handler = auth.clone()

handler.get((req, res) => {
  passport.authenticate(req.query.provider, {}, () => {
    try {
      res.statusCode = 302
      res.setHeader('Location', `/app`)
      res.end()
    } catch (e) {
      console.error('[callback] Error', e)
    }
  })(req, res)
})

export default handler.handler()
