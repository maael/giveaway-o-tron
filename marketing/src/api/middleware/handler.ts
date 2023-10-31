import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter, expressWrapper } from 'next-connect'

export { expressWrapper }

export default function createHandler() {
  return createRouter<NextApiRequest, NextApiResponse>()
}
