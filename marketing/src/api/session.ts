import { parse, serialize } from 'cookie'
import { createLoginSession, getLoginSession } from './auth'

function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie
  return parse(cookie || '')
}

export default function session({ name, secret, cookie: cookieOpts }) {
  return async (req, res, next) => {
    const cookies = parseCookies(req)
    const token = cookies[name]
    let unsealed = {}

    if (token) {
      try {
        // the cookie needs to be unsealed using the password `secret`
        unsealed = await getLoginSession(token, secret)
      } catch (e) {
        // The cookie is invalid
        console.error('[unseal:error]', e)
      }
    }

    req.session = unsealed

    // We are proxying res.end to commit the session cookie
    const oldEnd = res.end
    res.end = async function resEndProxy(...args) {
      if (res.finished || res.writableEnded || res.headersSent) return
      if (cookieOpts.maxAge) {
        req.session.maxAge = cookieOpts.maxAge
      }
      try {
        const token = await createLoginSession(req.session, secret)

        res.setHeader('Set-Cookie', serialize(name, token, cookieOpts))
        oldEnd.apply(this, args)
      } catch (e) {
        console.error('[resproxy:error]', e)
        oldEnd.apply(this, args)
      }
    }

    next()
  }
}
