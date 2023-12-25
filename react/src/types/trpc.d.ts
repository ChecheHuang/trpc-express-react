import { inferRouterOutputs, inferRouterInputs } from '@trpc/server'
import { AppRouter } from '~/routers/trpc'

export type TrpcOutputs = inferRouterOutputs<AppRouter>
export type TrpcInputs = inferRouterInputs<AppRouter>
