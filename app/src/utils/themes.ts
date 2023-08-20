import { useEffect, useMemo, useState } from 'react'

const DEFAULT_THEMES = [
  {
    id: 'gw2',
    name: 'Guild Wars 2',
    preview: '/images/gw2/preview.png',
  },
  {
    id: 'custom',
    name: 'Custom',
  },
]

export function useThemes() {
  const [themes, setThemes] = useState(DEFAULT_THEMES)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const fetchedThemes = await fetch('https://giveaway-o-tron.vercel.app/themes.json').then((r) => r.json())
        if (fetchedThemes.length > 2) {
          console.info('[themes:get:data]', fetchedThemes)
          setThemes(fetchedThemes)
        }
      } catch (e) {
        console.error('[themes:get:error]', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  return useMemo(() => ({ loading, themes, options: listToOptions(themes) }), [loading, themes])
}

function listToOptions(list: typeof DEFAULT_THEMES) {
  return list.map((item) => ({ value: item.id, label: item.name })).filter((i) => Boolean(i.label))
}
