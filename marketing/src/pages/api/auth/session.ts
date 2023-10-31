import auth from '~/api/middleware/auth'
import { FullNextApiRequest } from '~/api/types'

const handler = auth.clone()

handler.get((req: FullNextApiRequest, res) => {
  console.info('session', req.user)
  res.json({
    user: req.user,
  })
})

export default handler.handler()
