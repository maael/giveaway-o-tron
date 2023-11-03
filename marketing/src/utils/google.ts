import { getYoutubeRefresh } from '~/components/hooks/useSession'
import { wait } from './misc'

export const safeYoutubeFetch: typeof fetch = async (input, init) => {
  const request = await fetch(input, init)
  if (request.status === 409) {
    const newTokens = await fetch('/api/auth/refresh/youtube', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        refreshToken: getYoutubeRefresh(),
      }),
    }).then((r) => r.json())
    console.info('[youtube] Refresh tokens', newTokens)
  } else if (request.status === 403) {
    console.info('[youtube] Rate limited, waiting')
    await wait(60_000)
    console.info('[youtube] Rate limited, waited')
    return safeYoutubeFetch(input, init)
  }
  return request
}
