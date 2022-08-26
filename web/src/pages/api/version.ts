import { NextApiHandler } from 'next'
import fetch from 'isomorphic-fetch'
import cors from '~/functions/cors'

const handler: NextApiHandler = async (_req, res) => {
  const data = await fetch('https://api.github.com/repos/maael/giveaway-o-tron/releases/latest').then((r) => r.json())
  const resourceUrl = data.assets.find((a) => a.name.endsWith('.neu'))?.browser_download_url
  const resourceLocationRequest = await fetch(resourceUrl)
  res.json({
    version: (data.tag_name || '').replace('v', ''),
    resource_url: resourceLocationRequest.url || resourceUrl,
    applicationId: 'js.giveaway.otron',
    data: {
      niceResourceUrl: resourceUrl,
      url: data.html_url,
      publishedAt: data.published_at,
      body: data.body,
    },
  })
}

export default cors(handler)
