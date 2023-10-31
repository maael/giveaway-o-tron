import passport from '~/api/passport'
import createHandler from '~/api/middleware/handler'

const handler = createHandler()

handler.get((req, res) => {
  passport.authenticate(req.query.provider)(req, res)
})

export default handler.handler()
