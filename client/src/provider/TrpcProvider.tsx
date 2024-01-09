import { message } from 'antd'
import { RequestInitEsque } from 'node_modules/@trpc/client/dist/internals/types'
import { PropsWithChildren, useMemo } from 'react'
import { AppRouter } from '~/routers/trpc'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createTRPCProxyClient,
  createWSClient,
  httpLink,
  httpBatchLink,
  loggerLink,
  wsLink,
  splitLink,
  CreateTRPCClientOptions,
} from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { inferRouterOutputs, inferRouterInputs } from '@trpc/server'

import { trpcRequest } from '@/config/trpcRequest'
import { storage } from '@/lib/storage'

export type TrpcOutputs = inferRouterOutputs<AppRouter>
export type TrpcInputs = inferRouterInputs<AppRouter>

const createAuthHeaders = (token?: string): { Authorization?: string } => {
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
  }
}
const trpcSetting: CreateTRPCClientOptions<AppRouter> = {
  links: [
    splitLink({
      condition: (op) => {
        return op.type === 'subscription'
      },
      true: wsLink({
        client: createWSClient({
          url: `${import.meta.env.VITE_APP_BACKEND_WS_URL}/trpc`,
        }),
      }),
      false: httpLink({
        url: '/trpc',
        headers: createAuthHeaders(storage.get('jwt')?.access),
        fetch: async (
          url: URL | RequestInfo,
          options: RequestInit | RequestInitEsque | undefined,
        ) => {
          try {
            const res = await fetch(url, options)
            if (res.status < 400) return res
            const data = await res.clone().json()
            const errorMessage =
              data.error.message ||
              trpcRequest[
                res.statusText.toUpperCase() as keyof typeof trpcRequest
              ].translation ||
              'Something went wrong'
            if (errorMessage === 'Token已過期') {
              const refreshJwt = await trpcClient.auth.refreshToken.mutate({
                refreshToken: storage.get('jwt')?.refresh,
              })
              storage.set('jwt', refreshJwt)
              const reFetchRes = await fetch(url, {
                ...options,
                headers: {
                  ...options?.headers,
                  ...createAuthHeaders(refreshJwt?.access),
                },
              })
              return reFetchRes
            }
            message.destroy()
            message.error(errorMessage, 10)
            return res
          } catch (err) {
            message.error('連線失敗')
            throw err
          }
        },
      }),
    }),
  ],
}

export const trpcClient = createTRPCProxyClient<AppRouter>(trpcSetting)
export const trpcQuery = createTRPCReact<AppRouter>()
const TrpcProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: false,
          },
          mutations: {},
        },
      }),
    [],
  )
  const client = useMemo(() => trpcQuery.createClient(trpcSetting), [])
  return (
    <trpcQuery.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcQuery.Provider>
  )
}

export default TrpcProvider
