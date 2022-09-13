import { NextApiHandler } from 'next'
import * as Sentry from '@sentry/nextjs'
import fetch from 'isomorphic-fetch'
import cors from '~/functions/cors'

Sentry.init({
  dsn: 'https://8957e18171834887b99ab21344fecb79@o304997.ingest.sentry.io/6745326',
  tracesSampleRate: 1.0,
})

const handler: NextApiHandler = async (_req, res) => {
  const fetchRes = await fetch('https://api.github.com/repos/maael/giveaway-o-tron/releases/latest')
  const data = await fetchRes.json()
  const resourceUrl = (data.assets || []).find((a) => a.name.endsWith('.neu'))?.browser_download_url
  const responseData = {
    version: (data?.tag_name || '').replace('v', ''),
    resourcesURL: `https://giveaway-o-tron.vercel.app/versions/resources.neu`,
    applicationId: 'js.giveaway.otron',
    data: {
      ghResourceUrl: resourceUrl,
      url: data.html_url,
      publishedAt: data.published_at,
      body: data.body,
    },
  }
  if (!responseData.version) {
    Sentry.captureException(new Error(`Unexpected GitHub result: ${fetchRes.status}`), {
      tags: {
        version: responseData.version,
        dataResourceUrl: responseData.data.ghResourceUrl,
        dataUrl: responseData.data.url,
        dataPublishedAt: responseData.data.publishedAt,
      },
    })
  }
  res.json(responseData)
}

export default Sentry.withSentry(cors(handler))
