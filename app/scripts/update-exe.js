const rcedit = require('rcedit')
const fs = require('fs').promises
const path = require('path')
const icoPath = path.join(__dirname, '..', 'resources', 'icons', 'trayIcon.ico')
const exePath = path.join(__dirname, '..', 'dist', 'giveaway-o-tron', 'giveaway-o-tron.exe')
const getVersion = require('./util/version')

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function confirmFile(name, path) {
  return fs
    .stat(path)
    .then(() => {
      console.info(`[exe] ${name} exists`)
      return true
    })
    .catch((e) => {
      console.error(`[exe] Failed to find ${name}`, e)
      return false
    })
}

;(async () => {
  console.info('[exe:start]')
  console.info('[exe] CWD', process.cwd())
  console.info('[exe] dirname', __dirname)
  const version = getVersion()
  await wait(1_000)
  const iconExists = await confirmFile('icon', icoPath)
  const exeExists = await confirmFile('exe', exePath)
  if (!iconExists || !exeExists) throw new Error('Missing required file')
  const relativePath = ['.', path.sep, path.relative(process.cwd(), exePath)].join('')
  console.info('[exe] Relative path:', relativePath)
  await rcedit(relativePath, {
    icon: icoPath,
    'file-version': version,
    'product-version': version,
  })
  console.info('[exe:done] Set exe info')
})().catch((e) => console.error('[exe:error]', e))
