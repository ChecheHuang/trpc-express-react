import { router } from '../../lib/trpc'
import { auth } from './auth'
import { believer } from './believer'
import { dev } from './dev'
import { options } from './options'
import { permission } from './permission'
import { service } from './service'

export const trpcRouter = router({
  auth,
  dev,
  permission,
  believer,
  options,
  service,
})
export type AppRouter = typeof trpcRouter
