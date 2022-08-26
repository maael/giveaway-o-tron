import React from 'react'
import toast from 'react-hot-toast'

export const APP_VERSION: string | undefined = (globalThis as any).NL_APP_VERSION

export async function getLatestDifferentRelease() {
  try {
    const currentVersion = APP_VERSION
    const data = await fetch(`https://giveaway-o-tron.vercel.app/api/version`).then((res) => res.json())
    const updateInfo = {
      name: `v${data.version}`,
      resourceUrl: data.resource_url,
      url: data.data.url,
      body: data.data.body,
    }
    console.info('[update][latest]', updateInfo, currentVersion)
    if (updateInfo.name !== `v${currentVersion}`) {
      console.info('[update][new]', { current: `v${currentVersion}`, new: updateInfo.name })
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
      try {
        const newVersion = await getLatestDifferentRelease()
        if (newVersion) {
          toast((t) => {
            return (
              <div className="flex flex-row gap-4 justify-center items-center">
                <button onClick={() => Neutralino.os.open(newVersion.url)} className="underline text-purple-600">
                  {newVersion.name} available →
                </button>
                or
                <button
                  className="bg-purple-600 px-2 py-1 rounded-md text-white hover:scale-105"
                  onClick={async () => {
                    const original = await fetch(newVersion.resourceUrl)
                    console.info('status', original.status)
                    const resourceUrl = original.headers['location']
                    if (!resourceUrl) {
                      console.warn('Failed to find resourceUrl')
                      return
                    }
                    const data = await fetch(resourceUrl).then((data) => data.arrayBuffer())
                    await Neutralino.filesystem.writeBinaryFile('/test.res', data)
                    await Neutralino.app.restartProcess()
                  }}
                >
                  Update now
                </button>
              </div>
            )
          })
        }
      } catch (e) {
        console.warn('[update][error]', e)
      }
    })()
  }, [])
}
