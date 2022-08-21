import React from 'react'
import toast from 'react-hot-toast'

export const APP_VERSION: string | undefined = (globalThis as any).NL_APP_VERSION

export async function getLatestDifferentRelease() {
  try {
    const currentVersion = APP_VERSION
    const data = await fetch(`https://api.github.com/repos/maael/giveaway-o-tron/releases/latest`).then((res) =>
      res.json()
    )
    const updateInfo = {
      name: data.name,
      url: data.html_url,
      body: data.body,
    }
    console.info('[update][latest]', updateInfo, currentVersion)
    if (updateInfo.name !== `v${currentVersion}`) {
      return updateInfo
    }
    return null
  } catch (e) {
    console.error('[updates]', e.message)
    return null
  }
}

export function useUpdateCheck() {
  React.useEffect(() => {
    ;(async () => {
      const latestRelease = await getLatestDifferentRelease()
      if (latestRelease)
        toast((t) => {
          return (
            <button onClick={() => Neutralino.os.open(latestRelease?.url)} className="underline text-purple-600">
              Update {latestRelease?.name} available, go to download →
            </button>
          )
        })
    })()
  }, [])
}
