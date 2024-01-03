import { determineUserIsAllowed, getUser } from '../lib/jwt'
import { logserver } from './plugin'
import prismadb from './prismadb'
import { initTRPC, TRPCError } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { OpenApiMeta } from 'trpc-openapi'
import { z } from 'zod'

export const createContext = async (options: CreateExpressContextOptions) => {
  const { req, res } = options
  try {
    const url = req.originalUrl || req.url
    const user = await getUser(req)
    const isAllow = await determineUserIsAllowed({ url, user })

    return {
      req,
      res,
      user,
      isAllow,
    }
  } catch (error: unknown) {
    return {
      req,
      res,
      message: error as string,
    }
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create()
export const router = t.router

const isAuthMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: ctx.message })
  }
  // if (!ctx.isAllow) {
  //   throw new TRPCError({ code: 'UNAUTHORIZED', message: '沒有權限' })
  // }
  return next({ ctx: { user: ctx.user } })
})
export const procedure = t.procedure

export const privateProcedure = t.procedure.use(isAuthMiddleware)
