import useSession from './useSession'

const BETA_USERS = ['mukluk', 'odialo']

export function useBeta() {
  const session = useSession()
  return !!(session?.data?.twitch?.username && BETA_USERS.includes(session?.data?.twitch?.username))
}
