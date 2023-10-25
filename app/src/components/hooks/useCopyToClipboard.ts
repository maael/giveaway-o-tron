import * as React from 'react'

const useCopyToClipboard = (text: string, options: { resetTimeout: number } = { resetTimeout: 1000 }) => {
  const copyToClipboard = (str) => {
    const el = document.createElement('textarea')
    el.value = str
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    const rangeCount = document.getSelection()?.rangeCount || 0
    const selected = rangeCount > 0 ? document.getSelection()?.getRangeAt(0) : false
    el.select()
    const success = document.execCommand('copy')
    document.body.removeChild(el)
    if (selected) {
      document.getSelection()?.removeAllRanges()
      document.getSelection()?.addRange(selected)
    }
    return success
  }

  const mounted = React.useRef(false)
  const resetTimer = React.useRef<NodeJS.Timeout | undefined>()

  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    mounted.current = true
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
      mounted.current = false
    }
  }, [])
  const copy = React.useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
    setCopied(copyToClipboard(text))
    resetTimer.current = setTimeout(() => setCopied(false), options.resetTimeout)
  }, [text, options.resetTimeout])
  React.useEffect(
    () => () => {
      setCopied(false)
    },
    [text]
  )

  return [copied, copy] as const
}

export default useCopyToClipboard
