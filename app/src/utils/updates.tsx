import React from 'react'
import toast from 'react-hot-toast'
import * as Sentry from '@sentry/react'
import { wait } from './misc'

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

export async function checkForUpdate() {
  try {
    const manifest = await Neutralino.updater.checkForUpdates(`https://giveaway-o-tron.vercel.app/api/version`)
    if (manifest.version != NL_APPVERSION) {
      console.info('[update]', { from: NL_APPVERSION, to: manifest.version })
      toast((t) => {
        return (
          <div className="flex flex-row gap-4 justify-center items-center">
            <button onClick={() => Neutralino.os.open(manifest.data.url)} className="underline text-purple-600">
              v{manifest.version} available →
            </button>
            or
            <button
              className="bg-purple-600 px-2 py-1 rounded-md text-white hover:scale-105"
              onClick={async () => {
                toast('The app will now install the update and try to reopen, you may need to reopen it manually', {
                  position: 'bottom-center',
                  style: { textAlign: 'center' },
                })
                await Promise.all([Neutralino.updater.install(), wait(5000)])
                await Neutralino.app.restartProcess()
              }}
            >
              Update now
            </button>
          </div>
        )
      })
    } else {
      console.info('[update]', 'No update required')
    }
  } catch (e) {
    console.warn('[update][error]', e)
    Sentry.captureException(e)
    toast.error('Failed to check for update', {
      position: 'bottom-center',
      style: { fontSize: '1rem', padding: '0.2rem' },
    })
  }
}

export function useUpdateCheck() {
  React.useEffect(() => {
    void checkForUpdate()
  }, [])
}
