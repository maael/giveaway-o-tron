import auth from '~/api/middleware/auth'
import { FullNextApiRequest } from '~/api/types'

const handler = auth.clone()

handler.post((req: FullNextApiRequest, res) => {
  res.json({
    user: {
      ...req.user,
      ...req.body,
    },
  })
})

export default handler.handler()
