import auth from '~/api/middleware/auth'
import { FullNextApiRequest } from '~/api/types'

const handler = auth.clone()

handler.get((req: FullNextApiRequest, res) => {
  req.logOut()
  res.statusCode = 302
  res.setHeader('Location', `/`)
  res.end()
})

export default handler.handler()
