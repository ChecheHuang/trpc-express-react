import { TokenType, createToken, verifyToken } from '../../lib/jwt'
import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import bcrypt from 'bcrypt'
import { EventEmitter } from 'stream'
import { z } from 'zod'

const eventEmitter = new EventEmitter()

const tokenSchema = z.object({
  access: z.string(),
  refresh: z.string(),
})

export const auth = router({
  onLogin: procedure.subscription(() => {
    return observable<string>((emit) => {
      const listener = (data: any) => {
        emit.next(data)
      }
      eventEmitter.on('login', listener)
      return () => {
        eventEmitter.off('login', listener)
      }
    })
  }),
  login: procedure
    .meta({ openapi: { method: 'POST', path: '/login', tags: ['auth'], summary: '登入', description: '使用帳號密碼登入' } })
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
      })
    )
    .output(tokenSchema)
    .mutation(async ({ input }) => {
      const { name, password } = input
      const user = await prismadb.user.findFirst({
        select: {
          id: true,
          name: true,
          password: true,
        },
        where: {
          name,
        },
      })

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED', message: '沒有這個帳號' })

      const { password: dbPassword } = user
      const result = await bcrypt.compare(password, dbPassword)
      if (!result) throw new TRPCError({ code: 'UNAUTHORIZED', message: '密碼錯誤' })
      const token = createToken({
        id: user.id,
        name,
      })

      eventEmitter.emit('login', `${user.name} login`)

      return token
    }),
  refreshToken: procedure
    .meta({
      openapi: { method: 'POST', path: '/refreshToken', tags: ['auth'], summary: '更新 token', description: '更新 token' },
    })
    .input(z.object({ refreshToken: z.string() }))
    .output(tokenSchema)
    .mutation(async ({ input: { refreshToken } }) => {
      try {
        const decoded = await verifyToken(refreshToken)
        const jwt = createToken(decoded as TokenType)
        return jwt
      } catch (error) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '請重新登入' })
      }
    }),
  userInfo: privateProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/userInfo',
        tags: ['auth'],
        protect: true,
        summary: '取得使用者資訊',
        description: '取得使用者資訊',
      },
    })
    .input(z.void())
    .output(
      z.object({
        roles: z.array(z.string()),
        routes: z.array(
          z.object({
            path: z.string(),
            name: z.string(),
            isAllow: z.boolean(),
          })
        ),
        name: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      const id = ctx.user.id
      const result = await prismadb.user.findUnique({
        select: {
          name: true,
          rolesOnUsers: {
            select: {
              role: {
                select: {
                  id: true,
                  role: true,
                },
              },
            },
          },
        },
        where: {
          id,
        },
      })
      if (result === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '沒有這個帳號' })
      }
      const { rolesOnUsers, name } = result
      const roleIds: string[] = rolesOnUsers.reduce((acc, { role: { id } }) => {
        acc = [...acc, id]
        return acc
      }, [] as string[])

      const originRoutes = await prismadb.route.findMany({
        select: {
          id: true,
          name: true,
          path: true,
        },
      })
      const isAllowMapping = await prismadb.rolesOnRoutes.findMany({
        where: {
          roleId: {
            in: roleIds,
          },
        },
        select: {
          routeId: true,
          isAllow: true,
        },
      })
      const routes = originRoutes.map(({ id, ...rest }) => {
        const isAllow = isAllowMapping.find((route) => route.routeId === id)?.isAllow || false
        return {
          isAllow,
          ...rest,
        }
      })
      const roles = rolesOnUsers.map(({ role }) => role.role)
      const data = { roles, routes, name }
      return data
    }),
})
