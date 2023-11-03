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

function getFromStorage(key): Data {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || undefined
  } catch (e) {
    return
  }
}

export const getSession = () => getFromStorage(SESSION_KEY)
export const getYoutubeRefresh = () => getFromStorage(YOUTUBE_REFRESH_KEY)

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
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      if (user?.youtube?.refreshToken) {
        localStorage.setItem(YOUTUBE_REFRESH_KEY, user?.youtube?.refreshToken)
      }
    }
  }, [user, loading])
  return { data: user, loading, status: isLoading ? 'loading' : !user ? 'unauthenticated' : 'authenticated' }
}

export default function useSession() {
  return React.useContext(SessionContext)
}
