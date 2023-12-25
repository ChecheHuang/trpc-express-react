import { router } from '../../lib/trpc';
import { auth } from './auth';
import { believer } from './believer';
import { dev } from './dev';
import { options } from './options';
import { permission } from './permission';


export const trpcRouter = router({
  auth: auth,
  dev: dev,
  permission: permission,
  believer,
  options: options,
})
export type AppRouter = typeof trpcRouter