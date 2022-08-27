import { NextApiHandler } from 'next'
import fetch from 'isomorphic-fetch'
import cors from '~/functions/cors'

const handler: NextApiHandler = async (_req, res) => {
  const data = await fetch('https://api.github.com/repos/maael/giveaway-o-tron/releases/latest').then((r) => r.json())
  console.info('[github][response]', data)
  const resourceUrl = (data.assets || []).find((a) => a.name.endsWith('.neu'))?.browser_download_url
  res.json({
    version: (data.tag_name || '').replace('v', ''),
    resourcesURL: `https://giveaway-o-tron.vercel.app/versions/resources.neu`,
    applicationId: 'js.giveaway.otron',
    data: {
      ghResourceUrl: resourceUrl,
      url: data.html_url,
      publishedAt: data.published_at,
      body: data.body,
    },
  })
}

export default cors(handler)
