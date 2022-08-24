import '~/styles/main.css'
import Head from 'next/head'
import { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'
import useFathom from '~/components/hooks/useFathom'
import SEO from '~/../next-seo.config'
import EmojiFavicon from '~/components/primitives/EmojiFavicon'

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const fathom = useFathom()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e293b" />
      </Head>
      <DefaultSeo {...SEO} />
      <div className="flex flex-col gap-5 px-10 lg:px-3 mx-auto max-w-6xl pt-3 pb-20">
        <Component {...pageProps} fathom={fathom} />
      </div>
      <EmojiFavicon emoji="🤖" />
    </>
  )
}

export default App
