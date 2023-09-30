const path = require('path')

const configPath = path.join(__dirname, '..', '..', 'neutralino.config.json')
const config = require(configPath)

module.exports = function getVersion() {
  const githubRef = process.env.GITHUB_REF || ''
  let githubVersion
  if (githubRef.startsWith('refs/tags/v')) {
    githubVersion = githubRef.replace('refs/tags/v', '').trim()
  }

  console.info('[version:info]', {
    env: process.env.APP_VERSION,
    ref: githubVersion,
    config: config.version,
  })

  const foundVersion = process.env.APP_VERSION || githubVersion || config.version

  console.info('[version:final]', foundVersion)

  return foundVersion
}
