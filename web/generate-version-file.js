/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const configPath = path.join(__dirname, '.', 'src', 'version.json')

const config = {}
const githubRef = process.env.GITHUB_REF || ''

if (githubRef.startsWith('refs/tags/v')) {
  const githubVersion = githubRef.replace('refs/tags/v', '').trim()
  if (githubVersion) {
    config.tag = `v${githubVersion}`
  }
}

fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2), 'utf-8')

console.info('[config][updated]', { config })
