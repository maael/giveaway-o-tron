import { useEffect } from 'react'
import { ChannelInfo, validateToken, store } from '~/utils'

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
      console.info('[checkTwitchScopes]', channelInfo)
      const result = await validateToken(channelInfo.token, channelInfo.refreshToken, false)
      if (REQUIRED_SCOPES.some((s) => !(result?.scopes || []).includes(s))) {
        console.warn('Missing scopes, wiping tokens and prompting reauth')
        try {
          await store.setItem('main-channelInfo', '')
          window.location.search = '--restarted&--error=scopes'
          window.location.reload()
        } catch {
          window.location.search = '--restarted&--error=scopes'
          window.location.reload()
        }
      }
    })()
  }, [channelInfo])
}
