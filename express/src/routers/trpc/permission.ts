import prismadb from '../../lib/prismadb'
import { router, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

type BaseRouteType = {
  routeId: string
  path: string
  name: string
  isAllow: boolean
}
type RouteType = {
  children?: RouteType[]
} & BaseRouteType

const baseSchema: z.ZodType<BaseRouteType> = z.object({
  routeId: z.string(),
  path: z.string(),
  name: z.string(),
  isAllow: z.boolean(),
})
const routeSchema: z.ZodType<RouteType> = baseSchema.and(
  z.object({
    children: z
      .lazy(() => routeSchema)
      .array()
      .optional(),
  })
)

export const permission = router({
  usersWithRoles: privateProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/usersWithRoles',
        tags: ['permissions'],
        protect: true,
        summary: '使用者角色列表',
        description: '取得使用者角色列表',
      },
    })
    .input(
      z.object({
        name: z.string().optional(),
        roleId: z.string().optional(),
        _page: z.string().optional().default('1'),
        _limit: z.string().optional().default('10'),
      })
    )
    .output(
      z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            roles: z.array(
              z.object({
                id: z.string(),
                role: z.string(),
              })
            ),
          })
        ),
        total: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { name, roleId, _page, _limit } = input
      const take = parseInt(_limit)
      const skip = (parseInt(_page) - 1) * take
      const rolesOnUsersWhere = roleId
        ? {
            rolesOnEmployees: {
              some: {
                roleId: roleId,
              },
            },
          }
        : {}
      const nameWhere = name
        ? {
            name: {
              contains: name,
            },
          }
        : {}
      const where = {
        ...rolesOnUsersWhere,
        ...nameWhere,
      }
      const total = await prismadb.user.count({
        where,
      })
      const query = await prismadb.user.findMany({
        select: {
          id: true,
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
        where,
        take,
        skip,
      })
      const data = query.map(({ id, name, rolesOnUsers }) => {
        return {
          id,
          name,
          roles: rolesOnUsers.map((role) => {
            return {
              id: role.role.id.toString(),
              role: role.role.role,
            }
          }),
        }
      })

      return {
        data,
        total,
      }
    }),

  createUser: privateProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/createUser',
        tags: ['permissions'],
        protect: true,
        summary: '新增使用者',
        description: '新增使用者',
      },
    })
    .input(z.object({ name: z.string(), password: z.string(), roles: z.array(z.string()) }))
    .output(z.void())
    .mutation(async ({ input }) => {
      const { name, password, roles } = input
      const user = await prismadb.user.create({
        data: {
          name,
          password,
          rolesOnUsers: {
            createMany: {
              data: roles.map((roleId) => ({
                roleId,
              })),
            },
          },
        },
      })
    }),
  updateUser: privateProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/updateUser',
        tags: ['permissions'],
        protect: true,
        summary: ' 更新使用者',
        description: '更新使用者',
      },
    })
    .input(z.object({ userId: z.string(), name: z.string(), roles: z.array(z.string()) }))
    .output(z.void())
    .mutation(async ({ input }) => {
      const { userId, name, roles } = input
      await prismadb.rolesOnUsers.deleteMany({
        where: {
          userId,
        },
      })
      await prismadb.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          rolesOnUsers: {
            create: roles.map((item) => {
              return {
                roleId: item,
              }
            }),
          },
        },
      })
    }),
  rolesOption: privateProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/rolesOption',
        tags: ['permissions'],
        protect: true,
        summary: '角色選項',
        description: '角色選項',
      },
    })
    .input(z.void())
    .output(
      z.array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
    )
    .query(async () => {
      const rolesQuery = await prismadb.role.findMany({
        where: {
          status: {
            equals: true,
          },
        },
      })
      const options = rolesQuery.map(({ id, role }) => ({
        value: id.toString(),
        label: role,
      }))
      return options
    }),
  createRole: privateProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/createRole',
        tags: ['permissions'],
        protect: true,
        summary: '新增角色',
        description: '新增角色',
      },
    })
    .input(
      z.object({
        role: z.string(),
      })
    )
    .output(z.string())
    .mutation(async ({ input: { role } }) => {
      const routeIds = (
        await prismadb.route.findMany({
          select: {
            id: true,
          },
        })
      ).map((item) => ({ routeId: item.id }))
      const { id } = await prismadb.role.create({
        data: {
          role,
          rolesOnRoutes: {
            create: routeIds,
          },
        },
      })
      return id
    }),
  getRoles: privateProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/getRoles',
        tags: ['permissions'],
        protect: true,
        summary: '取得所有角色',
        description: '取得所有角色',
      },
    })
    .input(z.void())
    .output(
      z.array(
        z.object({
          id: z.string(),
          role: z.string(),
          status: z.boolean(),
        })
      )
    )
    .query(async () => {
      const data = await prismadb.role.findMany({
        select: {
          id: true,
          role: true,
          status: true,
        },
        orderBy: {
          id: 'asc',
        },
      })
      return data
    }),
  getRole: privateProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/getRole',
        tags: ['permissions'],
        protect: true,
        summary: '取得角色',
        description: '取得角色',
      },
    })
    .input(
      z.object({
        roleId: z.string(),
        name: z.string().optional(),
      })
    )
    .output(
      z.object({
        role: z.string(),
        id: z.string(),
        routes: z.array(routeSchema),
        apiList: z.array(
          z.object({
            id: z.string(),
            name: z.string().nullish(),
            router: z.string().nullish(),
            swaggerMethod: z.string().nullish(),
            swaggerSummary: z.string().nullish(),
            isAllow: z.boolean(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const { roleId, name } = input
      const where = name
        ? {
            name: {
              contains: name,
            },
          }
        : {}
      //身分
      const role = await prismadb.role.findUnique({
        select: {
          id: true,
          role: true,
        },
        where: {
          id: roleId,
        },
      })
      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '角色不存在',
        })
      }

      //路由
      const allRoute = await prismadb.route.findMany({
        select: {
          id: true,
          name: true,
          path: true,
          parentId: true,
        },
        where,
      })

      const routeOnRole = await prismadb.rolesOnRoutes.findMany({
        where: {
          roleId: roleId,
        },
        select: {
          routeId: true,
          isAllow: true,
        },
      })
      const allRouteMapRouteOnRole = allRoute.map(({ name, path, id: routeId }) => {
        const isAllow = routeOnRole.find((item) => item.routeId === routeId)?.isAllow || false
        return { routeId, name, path, isAllow }
      })

      const routes = structuredRoutesFn(allRouteMapRouteOnRole) as unknown as RouteType[]

      const apis = await prismadb.api.findMany({
        select: {
          id: true,
          router: true,
          name: true,
          swaggerSummary: true,
          swaggerMethod: true,
        },
      })

      const rolesOnApisByRoleId = await prismadb.rolesOnApis.findMany({
        where: {
          roleId: roleId,
        },
        select: {
          apiId: true,
          isAllow: true,
        },
      })

      const apiList = apis.map((api) => {
        const isAllow = rolesOnApisByRoleId.find((item) => item.apiId === api.id)?.isAllow || false
        return { ...api, isAllow }
      })
      const data = { role: role.role, id: role.id, routes: routes, apiList }
      return data
    }),

  updateRoleRoute: privateProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/updateRoleRoute',
        tags: ['permissions'],
        protect: true,
        summary: '更新角色路由',
        description: '更新角色路由',
      },
    })
    .input(
      z.object({
        roleId: z.string(),
        isAllow: z.boolean(),
        routeIds: z.array(z.string()),
      })
    )
    .output(z.void())
    .mutation(async ({ input: { roleId, isAllow, routeIds } }) => {
      const updates = routeIds.map(async (routeId: string) => {
        return prismadb.rolesOnRoutes.upsert({
          where: {
            roleId_routeId: {
              roleId,
              routeId,
            },
          },
          update: {
            isAllow,
          },
          create: {
            roleId,
            routeId,
            isAllow,
          },
        })
      })
    }),
  updateRoleApi: privateProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/updateRoleApi',
        tags: ['permissions'],
        protect: true,
        summary: '更新角色 API',
        description: '更新角色 API',
      },
    })
    .input(
      z.object({
        roleId: z.string(),
        apiId: z.string(),
        isAllow: z.boolean(),
      })
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      const { roleId, apiId, isAllow } = input
      await prismadb.rolesOnApis.upsert({
        where: {
          roleId_apiId: {
            roleId,
            apiId,
          },
        },
        update: {
          isAllow,
        },
        create: {
          roleId,
          apiId,
          isAllow,
        },
      })
    }),
})

interface StruturedRouteType {
  path: string
  parentPath?: string // 新增 parentPath 属性
  children?: StruturedRouteType[]
}
function structuredRoutesFn<T extends StruturedRouteType>(data: StruturedRouteType[], isAddParentPath = false): T[] {
  const success = data.reduce((result: StruturedRouteType[], item: StruturedRouteType) => {
    const { path, ...rest } = item
    const pathParts = path.split('/').filter((part: string) => part !== '')
    const parent = pathParts.reduce((parent: StruturedRouteType | null, part: string, index: number) => {
      const path = `/${pathParts.slice(0, index + 1).join('/')}`
      const existingPath = parent
        ? parent.children?.find((child: StruturedRouteType) => child.path === path)
        : result.find((child: StruturedRouteType) => child.path === path)

      if (existingPath) {
        return existingPath
      } else {
        const newPath: StruturedRouteType = {
          path,
          ...rest,
        }
        if (isAddParentPath) {
          newPath.parentPath = parent?.path
        }
        if (parent) {
          const parentChildren = parent.children || []
          parent.children = [...parentChildren, newPath]
        } else {
          result = [...result, newPath]
        }

        return newPath
      }
    }, null)

    return result
  }, [])
  return success[0].children as T[]
}
