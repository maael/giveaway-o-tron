import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBeta } from './useBeta'

export default function usePatreons() {
  const isBeta = useBeta()
  const [patreons, setPatreons] = useState(() => new Set<string>())
  const getPatreons = useCallback(async () => {
    console.info('[patreons]', { isBeta })
    if (!isBeta) return new Set<string>()
    const patreons = await fetch('https://mukluklabs.com/api/connections')
      .then((r) => r.json())
      .catch(() => [])
    console.info('[patreons]', patreons)
    const mappedPatreons = new Map<string, any>(patreons)
    const twitchIds = new Set<string>([...mappedPatreons.keys()])
    setPatreons(twitchIds)
    return twitchIds
  }, [setPatreons, isBeta])
  useEffect(() => {
    getPatreons()
  }, [isBeta])
  return useMemo(() => ({ patreons, getPatreons }), [patreons, getPatreons])
}
