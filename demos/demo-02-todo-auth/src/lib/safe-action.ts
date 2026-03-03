import { createSafeActionClient } from 'next-safe-action'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export const actionClient = createSafeActionClient()

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('未登录')
  return next({ ctx: { session } })
})
