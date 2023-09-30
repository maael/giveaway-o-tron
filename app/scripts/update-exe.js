const rcedit = require('rcedit')
const path = require('path')
const icoPath = path.join(__dirname, '..', 'resources', 'icons', 'trayIcon.ico')
const exePath = path.join(__dirname, '..', 'dist', 'giveaway-o-tron', 'giveaway-o-tron.exe')
const getVersion = require('./util/version')

;(async () => {
  console.info('[exe:start]')
  const version = getVersion()
  await rcedit(exePath, {
    icon: icoPath,
    'file-version': version,
    'product-version': version,
  })
  console.info('[exe:done] Set exe info')
})().catch((e) => console.error('[exe:error]', e))
