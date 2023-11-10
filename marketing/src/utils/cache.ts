import { store as dataStore } from './storage'

export enum CACHE_KEY {
  dumbfollows = 'dumbfollows',
  dumbsubs = 'dumbsubs',
}

type Platform = 'youtube' | 'twitch'

export class Cache {
  key: `${string}-${CACHE_KEY}`

  constructor(platform: Platform, channel: string, key: CACHE_KEY) {
    if (platform === 'twitch') {
      this.key = `${channel}-${key}`
    } else {
      this.key = `${platform}-${channel}-${key}`
    }
  }

  get = async function get() {
    try {
      return new Map((await dataStore.getItem<any[]>(this.key)) || [])
    } catch (e) {
      console.info('[CACHE][ERROR]', this.key, e)
      return new Map()
    }
  }

  store = async function store(data: Map<any, any>) {
    await dataStore.setItem(
      this.key,
      [...data].filter((d) => d[0] !== null)
    )
  }
}
