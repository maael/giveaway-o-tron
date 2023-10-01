import localForage from 'localforage'

export const store = localForage.createInstance({
  name: 'giveaway-o-tron',
  driver: localForage.INDEXEDDB,
  version: 1.0,
  storeName: 'giveaway_o_tron',
  description: 'Main storage for giveaway-o-tron app.',
})
