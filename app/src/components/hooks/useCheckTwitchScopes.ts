import { useEffect } from 'react'
import { ChannelInfo, validateToken } from '~/utils'

const REQUIRED_SCOPES = [
  'openid',
  'user:read:email',
  'user:read:subscriptions',
  'chat:read',
  'chat:edit',
  'channel:read:subscriptions',
  'channel_subscriptions',
  'moderator:read:followers',
]

export default function useCheckTwitchScopes(channelInfo: ChannelInfo) {
  useEffect(() => {
    ;(async () => {
      if (!channelInfo.token || !channelInfo.refreshToken) {
        return
      }
      const result = await validateToken(channelInfo.token, channelInfo.refreshToken, false)
      if (REQUIRED_SCOPES.some((s) => !(result?.scopes || []).includes(s))) {
        console.warn('Missing scopes, wiping tokens and prompting reauth')
        try {
          await Neutralino.storage.setData('main-channelinfo', null)
          await Neutralino.filesystem.readDirectory(`${NL_CWD}/.storage/main-channelinfo.neustorage`)
          await Neutralino.app.restartProcess({ args: '--restarted --error=scopes' })
        } catch {
          await Neutralino.app.restartProcess({ args: '--restarted --error=scopes' })
        }
      }
    })()
  }, [channelInfo])
}
