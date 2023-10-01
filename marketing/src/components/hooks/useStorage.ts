import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { store } from '~/utils/storage'

export default function useStorage<T>(
  key: string,
  initialValue: T,
  onInit?: (value: T) => void
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initialValue)
  const [syncedState, setSyncedState] = useState<T>(state)
  const [initialised, setInitialised] = useState(false)
  const getKey = useCallback((key: string) => {
    return `main-${key}`
  }, [])
  useEffect(() => {
    const value = state
    ;(async () => {
      if (syncedState === value) return
      try {
        console.info('[storage:set]', getKey(key), value)
        await store.setItem(getKey(key), value)
        setSyncedState(value)
      } catch (e) {
        console.warn('[storage:error]', e)
      }
    })()
  }, [state, getKey])
  useEffect(() => {
    ;(async () => {
      let value: T | null = initialValue
      try {
        try {
          value = await store.getItem<T>(getKey(key))
        } catch (e) {
          console.warn('[storage:warn]', e)
        }
        setState(value || initialValue)
        console.info('[storage:loaded]', getKey(key), value)
        try {
          await store.setItem(getKey(key), value)
        } catch (e) {
          console.warn('[storage:warn]', e)
        }
      } finally {
        if (onInit) onInit(value || initialValue)
        setInitialised(true)
      }
    })()
  }, [key, getKey])
  // if (key === 'channelInfo' && state && (state as any).userId === '69496551') {
  //   ;(state as any).userId = '132739183' // Mock as Muk
  //   ;(state as any).login = 'mukluk'
  // }
  return [state, setState, initialised]
}
