import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { z } from 'zod'

export const options = router({
  cityOptions: procedure
    .meta({ openapi: { method: 'GET', path: '/cityOptions', tags: ['options'], summary: '城市選項', description: '城市選項' } })
    .input(z.void())
    .output(z.any())
    .query(async () => {
      const citys = await prismadb.city.findMany({
        select: {
          name: true,
          areas: {
            select: {
              name: true,
              roads: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      })

      const result = citys.reduce((acc, { name, areas }) => {
        const area = areas.reduce((acc, { name, roads }) => {
          acc[name] = roads.map(({ name }) => name)
          return acc
        }, {} as any)
        acc[name] = area
        return acc
      }, {} as any)

      return result
    }),
})
