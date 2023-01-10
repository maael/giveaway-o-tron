import * as React from 'react'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { FaCheck, FaCopy } from 'react-icons/fa'
import useCopyToClipboard from '~/components/hooks/useCopyToClipboard'

export default function Index() {
  const session = useSession()
  React.useEffect(() => {
    if (session.status === 'unauthenticated') {
      signIn('twitch')
    }
  }, [session.status])
  const [copiedAccessToken, copyAccessToken] = useCopyToClipboard((session.data as any)?.accessToken)
  const [copiedRefreshToken, copyRefreshToken] = useCopyToClipboard((session.data as any)?.refreshToken)
  return (
    <div className="bg-gray-800 text-white flex flex-col gap-2 justify-center items-center">
      {session.status === 'loading' ? null : (
        <>
          {session?.data?.user?.image ? <Image src={session?.data?.user?.image} height={150} width={150} /> : null}
          <div>Hey {session?.data?.user?.name}!</div>
          <div className="flex flex-row">
            <div className="px-2 py-1 bg-gray-600 rounded-l-md">Access Token</div>
            <input
              className="px-2 py-1 bg-gray-300 text-gray-800 overflow-ellipsis"
              readOnly
              value={(session.data as any)?.accessToken}
              type="password"
            />
            <button className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700" onClick={() => copyAccessToken()}>
              {copiedAccessToken ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          <div className="flex flex-row">
            <div className="px-2 py-1 bg-gray-600 rounded-l-md">Refresh Token</div>
            <input
              className="px-2 py-1 bg-gray-300 text-gray-800 overflow-ellipsis"
              readOnly
              value={(session.data as any)?.refreshToken}
              type="password"
            />
            <button className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700" onClick={() => copyRefreshToken()}>
              {copiedRefreshToken ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          <div className="mt-5 text-sm">To finish setup, enter these tokens on the app.</div>
          <button className="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-700" onClick={() => signOut()}>
            Logout / Refresh Tokens
          </button>
        </>
      )}
    </div>
  )
}
