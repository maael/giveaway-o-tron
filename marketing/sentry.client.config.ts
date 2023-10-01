// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://75819e99affe635bee501e01dd1f7a44@o304997.ingest.sentry.io/4505975938416640',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.8,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    new Sentry.Replay({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event) {
    if (event.message?.includes('Unable to connect.')) return null
    if (
      event.message?.includes('Cannot disconnect from server. Socket is not opened or connection is already closing.')
    ) {
      return null
    }
    return event
  },
})
