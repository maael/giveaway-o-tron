import { useEffect } from 'react'
import { ChannelInfo } from './types'

export class AuthEvent extends EventTarget {
  emit(type: string, channelInfo: ChannelInfo) {
    this.dispatchEvent(new CustomEvent(type, { detail: channelInfo }))
  }
}

const authEmitter = new AuthEvent()

export function useAuthEvents(onRefresh: (info: ChannelInfo) => void) {
  useEffect(() => {
    function handler(e: CustomEvent<AuthEvent>) {
      onRefresh(e.detail as any)
    }
    authEmitter.addEventListener('refresh', handler)
    return () => authEmitter.removeEventListener('refresh', handler)
  }, [authEmitter, onRefresh])
}

export async function validateToken(token: string, refreshToken: string, isRefreshValidate: boolean = false) {
  try {
    const res = await fetch(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    })
    if (res.status === 401 && !isRefreshValidate) {
      console.warn('[validate][refresh]')
      return refreshTokenFlow(refreshToken)
    }
    const data = (await res.json()) as any
    console.info('[validate]', data, token, refreshToken)
    return {
      token,
      refreshToken,
      clientId: data.client_id,
      login: data.login,
      userId: data.user_id,
    }
  } catch (e) {
    console.info('[validate][error]', e)
    return null
  }
}

export async function refreshTokenFlow(refreshToken: string) {
  console.info('[refreshTokenFlow]', refreshToken)
  const channelInfo: ChannelInfo = await JSON.parse(await Neutralino.storage.getData('main-channelinfo'))
  const details = {
    client_id: channelInfo.clientId || atob(globalThis.NL_TID),
    client_secret: atob(globalThis.NL_TS),
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }

  const formBody: string[] = []
  for (let property in details) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(details[property])
    formBody.push(`${encodedKey}=${encodedValue}`)
  }
  const body = formBody.join('&')
  const res = await fetch(`https://id.twitch.tv/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body,
  })
  if (res.status === 403) {
    console.error('[refresh][error]')
    throw Error('Refresh token failed')
  }
  const data = (await res.json()) as {
    access_token: string
    refresh_token: string
  }
  await Neutralino.storage.setData(
    'main-channelinfo',
    JSON.stringify({ ...channelInfo, token: data.access_token, refreshToken: data.refresh_token })
  )
  const validated = await validateToken(data.access_token, data.refresh_token)
  if (validated) authEmitter.emit('refresh', { ...validated, refreshToken: data.refresh_token })
  return validated
}
