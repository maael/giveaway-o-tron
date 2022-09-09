/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')(['auto-text-size'])

module.exports = withTM({
  images: {
    domains: ['static-cdn.jtvnw.net'],
  },
})
