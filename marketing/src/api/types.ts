import { NextApiRequest } from 'next'

interface User {
  id: string
  campaign: string
}

export type FullNextApiRequest = NextApiRequest & {
  session: {
    users: User[]
  }
  campaign?: any
  user: User
  logIn: (user: any, cb: (err: Error) => void) => void
  logOut: () => void
}
