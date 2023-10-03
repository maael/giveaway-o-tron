import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only supports POST requests' })
  }

  if (!(req.body as any).refreshToken) {
    return res.status(400).json({ error: 'Requires refresh token' })
  }

  const details = {
    client_id: process.env.TWITCH_ID,
    client_secret: process.env.TWITCH_SECRET,
    grant_type: 'refresh_token',
    refresh_token: (req.body as any).refreshToken,
  }

  const formBody: string[] = []
  for (let property in details) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(details[property])
    formBody.push(`${encodedKey}=${encodedValue}`)
  }
  const body = formBody.join('&')
  const result = await fetch(`https://id.twitch.tv/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body,
  })

  if (result.status === 403) {
    console.error('[refresh][error]')
    res.status(403).json({ error: 'Failed to refresh token' })
  }

  const data = await result.json()

  res.status(data?.status || 200).json(data)
}

export default handler
