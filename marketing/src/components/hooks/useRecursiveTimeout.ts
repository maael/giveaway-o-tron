import { useEffect, useRef } from 'react'

export function useRecursiveTimeout<T>(label: string, callback: () => Promise<T> | void, delay: number | null) {
  const savedCallback = useRef(callback)
  const savedDelay = useRef(delay)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    savedDelay.current = delay
  }, [delay])

  useEffect(() => {
    let id: NodeJS.Timeout
    function tick() {
      const ret = savedCallback.current()

      if (ret instanceof Promise) {
        ret.then(() => {
          if (savedDelay.current !== null) {
            id = setTimeout(tick, savedDelay.current)
          }
        })
      } else {
        if (savedDelay.current !== null) {
          id = setTimeout(tick, savedDelay.current)
        }
      }
    }
    if (savedDelay.current !== null) {
      id = setTimeout(tick, savedDelay.current)
      return () => id && clearTimeout(id)
    }
  }, [delay, label])
}
