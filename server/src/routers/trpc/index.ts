import { router } from '../../lib/trpc'
import { auth } from './auth'
import { believer } from './believer'
import { dev } from './dev'
import { options } from './options'
import { order } from './order'
import { permission } from './permission'
import { service } from './service'
import { temple } from './temple'

export const trpcRouter = router({
  auth,
  dev,
  permission,
  believer,
  options,
  service,
  order,
  temple,
})
export type AppRouter = typeof trpcRouter
