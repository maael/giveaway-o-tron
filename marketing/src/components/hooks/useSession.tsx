import React from 'react'
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

export function SessionProvider({ children }: React.PropsWithChildren) {
  const session = useLoadSession()
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useLoadSession() {
  const { data, isLoading } = useSWR(`/api/auth/session`, fetcher)
  // if data is not defined, the query has not completed
  const loading = isLoading || !data
  const user = data?.user
  return { data: user, loading, status: isLoading ? 'loading' : !user ? 'unauthenticated' : 'authenticated' }
}

export default function useSession() {
  return React.useContext(SessionContext)
}
