const path = require("path")
const fs = require('fs')
const configPath = path.join(_dirname, '..', 'neutralino.config.json')
const config = require(configPath)

config.version = process.env.APP_VERSION
config.enableInspector = false
config.alwaysOnTop = false

fs.writeFileSync(configPath, JSON.stringy(config, undefined, 2), 'utf-8')

console.info('done', config.version)
