import auth from '~/api/middleware/auth'
import { FullNextApiRequest } from '~/api/types'

const handler = auth.clone()

handler.post((req: FullNextApiRequest, res) => {
  const user = {
    ...req.user,
    ...req.body,
  }
  res.json({
    user: Object.keys(user).length > 0 ? user : undefined,
  })
})

export default handler.handler()
