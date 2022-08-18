import * as React from 'react'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'

export default function Index() {
  const session = useSession()
  React.useEffect(() => {
    if (session.status === 'unauthenticated') {
      signIn('twitch')
    }
  }, [session.status])
  return (
    <div className="bg-gray-800 text-white flex flex-col gap-2 justify-center items-center">
      {session.status === 'loading' ? null : (
        <>
          {session?.data?.user?.image ? <Image src={session?.data?.user?.image} height={150} width={150} /> : null}
          <div>Hey {session?.data?.user?.name}!</div>
          <div className="flex flex-row">
            <div className="px-2 py-1 bg-gray-600 rounded-l-md">Access Token</div>
            <input
              className="px-2 py-1 bg-gray-300 rounded-r-md text-gray-800 overflow-ellipsis"
              readOnly
              value={(session.data as any)?.accessToken}
            />
          </div>
          <div className="flex flex-row">
            <div className="px-2 py-1 bg-gray-600 rounded-l-md">Refresh Token</div>
            <input
              className="px-2 py-1 bg-gray-300 rounded-r-md text-gray-800 overflow-ellipsis"
              readOnly
              value={(session.data as any)?.refreshToken}
            />
          </div>
          <div className="mt-5 text-sm">To finish setup, enter these tokens on the app.</div>
        </>
      )}
    </div>
  )
}
