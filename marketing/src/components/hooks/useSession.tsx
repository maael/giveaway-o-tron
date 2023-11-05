import React, { useEffect } from 'react'
import useSWR from 'swr'

export const fetcher = (url) => fetch(url).then((r) => r.json())

type Data =
  | undefined
  | {
      youtube?: {
        accessToken: string
        refreshToken: string
        username: string
        id: string
      }
      twitch?: {
        accessToken: string
        refreshToken: string
        username: string
        id: string
      }
    }

const SessionContext = React.createContext<{ data: Data; loading: boolean; status: string }>({
  data: undefined,
  loading: true,
  status: 'loading',
})

const SESSION_KEY = 'giveaway-user-session/v1'
const YOUTUBE_REFRESH_KEY = 'giveaway-youtube-refresh'

function getFromStorage<T>(key, options: { parse: boolean }): T | undefined {
  try {
    const found = localStorage.getItem(key)
    if (options.parse) {
      return JSON.parse(found || 'null') || undefined
    } else {
      return found as T
    }
  } catch (e) {
    console.info('[youtube][error]', e, localStorage.getItem(key))
    return
  }
}

export const getSession = () => getFromStorage<Data>(SESSION_KEY, { parse: true })
export const getYoutubeRefresh = () => getFromStorage<string>(YOUTUBE_REFRESH_KEY, { parse: false })

export function SessionProvider({ children }: React.PropsWithChildren) {
  const session = useLoadSession()
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useLoadSession() {
  const { data, isLoading } = useSWR(`/api/auth/session`, fetcher)
  // if data is not defined, the query has not completed
  const loading = isLoading || !data
  const user: Data = data?.user
  useEffect(() => {
    if (!loading && user) {
      const existing = getSession()
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...(existing || {}), ...user }))
      if (user?.youtube?.refreshToken) {
        console.info('[youtube][refresh][save]', user?.youtube?.refreshToken)
        localStorage.setItem(YOUTUBE_REFRESH_KEY, user?.youtube?.refreshToken)
      }
    }
  }, [user, loading])
  return { data: user, loading, status: isLoading ? 'loading' : !user ? 'unauthenticated' : 'authenticated' }
}

export default function useSession() {
  return React.useContext(SessionContext)
}
