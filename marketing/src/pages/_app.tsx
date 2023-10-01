import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import '../styles/globals.css'
import Head from 'next/head'
import useFathom from '~/components/hooks/useFathom'
import { DefaultSeo } from 'next-seo'
import SEO from '~/next-seo.config'

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const fathom = useFathom()
  return (
    <>
      <Head>
        <link rel="icon" type="image/x-icon" href="/icons/appIcon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e293b" />
      </Head>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} fathom={fathom} session={session} />
      <Toaster />
    </>
  )
}
