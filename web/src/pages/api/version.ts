import { NextApiHandler } from 'next'
import * as Sentry from '@sentry/nextjs'
import fetch from 'isomorphic-fetch'
import cors from '~/functions/cors'

const versionFileInfo: any = {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { tag } = require('../../version.json')
  versionFileInfo.version = (tag || '').replace('v', '')
  if (versionFileInfo.version) {
    versionFileInfo.ghResourceUrl = `https://github.com/maael/giveaway-o-tron/releases/download/v${versionFileInfo.version}/resources.neu`
    versionFileInfo.url = `https://github.com/maael/giveaway-o-tron/releases/tag/v${versionFileInfo.version}`
  }
} catch (e) {
  Sentry.captureException(e)
  console.error(e)
}

Sentry.init({
  dsn: 'https://8957e18171834887b99ab21344fecb79@o304997.ingest.sentry.io/6745326',
  tracesSampleRate: 1.0,
})

const handler: NextApiHandler = async (_req, res) => {
  let responseData: Partial<{
    version?: string
    resourcesURL: string
    applicationId: string
    data: {
      ghResourceUrl?: string
      url?: string
      publishedAt: string
      body: string
    }
  }> = {}
  if (versionFileInfo.version) {
    responseData = {
      version: versionFileInfo.version,
      resourcesURL: `https://giveaway-o-tron.vercel.app/versions/resources.neu`,
      applicationId: 'js.giveaway.otron',
      data: {
        ghResourceUrl: versionFileInfo.ghResourceUrl,
        url: versionFileInfo.url,
        publishedAt: new Date().toISOString(),
        body: '',
      },
    }
  } else {
    const fetchRes = await fetch('https://api.github.com/repos/maael/giveaway-o-tron/releases/latest')
    const data = await fetchRes.json()
    const resourceUrl = (data.assets || []).find((a) => a.name.endsWith('.neu'))?.browser_download_url
    responseData = {
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
          dataResourceUrl: responseData?.data?.ghResourceUrl,
          dataUrl: responseData?.data?.url,
          dataPublishedAt: responseData?.data?.publishedAt,
        },
      })
    }
  }
  res.json(responseData)
}

export default Sentry.withSentry(cors(handler))
