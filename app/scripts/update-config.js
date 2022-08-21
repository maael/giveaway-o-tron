const fs = require('fs')
const path = require('path')

const configPath = path.join(__dirname, '..', 'neutralino.config.json')
const config = require(configPath)

console.info('[config][original]', { version: config.version })

config.modes = config.modes || {}
config.modes.window = config.modes.window || {}
config.modes.window.enableInspector = false
config.modes.window.alwaysOnTop = false

const githubRef = process.env.GITHUB_REF || ''
let githubVersion
if (githubRef.startsWith('refs/tags/v')) {
  githubVersion = githubRef.replace('refs/tags/v', '').trim()
}

config.version = process.env.APP_VERSION || githubVersion || config.version
config.globalVariables.APP_VERSION = config.version
config.modes.browser.globalVariables.APP_VERSION = config.version

fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2), 'utf-8')

console.info('[config][updated]', { version: config.version })
