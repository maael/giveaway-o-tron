import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import { useEffect, useState } from 'react'

export function TimeProgressBar({ timeMs }: { timeMs: null | number }) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  useEffect(() => {
    if (!timeMs) {
      setStartTime(null)
    } else {
      setStartTime(+new Date())
    }
  }, [timeMs])
  useEffect(() => {
    const interval = setInterval(() => {
      if (timeMs && startTime) {
        const timeSinceStart = differenceInMilliseconds(new Date(), startTime)
        const progress = 100 - Number(((timeSinceStart / timeMs) * 100).toFixed(0))
        setProgress(progress)
        if (progress === 0) {
          setStartTime(+new Date())
        }
      } else {
        setProgress(null)
      }
    }, 100)
    return () => {
      clearInterval(interval)
    }
  }, [startTime, timeMs])
  return startTime ? <div className="bg-red-600 h-1 transition-all" style={{ width: `${progress}%` }} /> : null
}
