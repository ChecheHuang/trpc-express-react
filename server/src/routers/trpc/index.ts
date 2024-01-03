import { router } from '../../lib/trpc';
import { auth } from './auth';
import { believer } from './believer';
import { dev } from './dev';
import { options } from './options';
import { order } from './order';
import { permission } from './permission';
import { service } from './service'


export const trpcRouter = router({
  auth,
  dev,
  permission,
  believer,
  options,
  service,
  order,
})
export type AppRouter = typeof trpcRouter