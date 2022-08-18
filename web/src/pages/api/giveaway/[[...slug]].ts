import { NextApiHandler } from 'next'
import giveawayMethods from '../../../functions/giveaways'

const methods: Partial<Record<`[${'all' | 'one'}][${'GET' | 'POST' | 'DELETE' | 'PATCH'}]`, NextApiHandler>> = {
  '[all][GET]': giveawayMethods.all.get,
  '[one][GET]': giveawayMethods.one.get,
  '[all][POST]': giveawayMethods.all.post,
  '[one][DELETE]': giveawayMethods.one.delete,
  '[one][PATCH]': giveawayMethods.one.patch,
}

const handler: NextApiHandler = async (req, res) => {
  const slug = req.query.slug as string[] | undefined
  const methodId = `[${slug ? 'one' : 'all'}][${req.method}]`
  console.info('[methodId]', methodId)
  const method = methods[methodId]
  if (method) {
    method(req, res)
  } else {
    res.status(401).json({ error: 'Not implemented' })
  }
}

export default handler
