import prismadb from '../../lib/prismadb'
import { router, procedure } from '../../lib/trpc'
import { z } from 'zod'

type RouteType = {
  path: string
  name: string
  children?: RouteType[]
}

const routeSchema: z.ZodType<RouteType> = z
  .object({
    path: z.string(),
    name: z.string(),
  })
  .and(
    z.object({
      children: z
        .lazy(() => routeSchema)
        .array()
        .optional(),
    })
  )

type SeedRouteType = Omit<RouteType, 'children'> & {
  children?: { create: SeedRouteType[] }
  rolesOnRoutes?: {
    create: { roleId: string }[]
  }
}
function makeSeedRoute(routes: RouteType[]): SeedRouteType[] {
  return routes.map((route) => {
    const { path, name, children } = route

    const filteredRoute: SeedRouteType = {
      path,
      name,
    }

    if (children) {
      filteredRoute.children = {
        create: makeSeedRoute(children),
      }
    }

    return filteredRoute
  })
}

export const dev = router({
  getRouters: procedure
    .meta({
      openapi: { method: 'GET', path: '/getRouters', tags: ['dev'], summary: '取得路由', description: '取得所有前端路由' },
    })
    .input(z.void())
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          path: z.string(),
        })
      )
    )
    .query(async () => {
      const routes = await prismadb.route.findMany({
        select: {
          id: true,
          name: true,
          path: true,
        },
      })
      return routes
    }),
  createRouter: procedure
    .meta({
      openapi: { method: 'POST', path: '/createRouter', tags: ['dev'], summary: '創建前端路由', description: '創建前端路由' },
    })
    .input(
      z.object({
        route: z.array(routeSchema),
        parentPath: z.string(),
      })
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      const { route, parentPath } = input
      const parent = await prismadb.route.findUnique({
        where: {
          path: parentPath,
        },
        select: {
          id: true,
        },
      })
      const parentId = parent?.id || null

      const withOutParentIdData = makeSeedRoute(route)[0]
      const data = { ...withOutParentIdData, parentId }

      await prismadb.route.create({
        data,
      })
    }),
  editRouter: procedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/editRouter',
        tags: ['dev'],
        summary: '修改前端路由名稱',
        description: '修改前端路由名稱',
      },
    })
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      const { id, name } = input
      const update = await prismadb.route.update({
        where: {
          id,
        },
        data: {
          name,
        },
      })
    }),
})
