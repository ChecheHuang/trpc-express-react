import { getBelieverListById } from '../../../lib/cusFn/getBelieverListById'
import prismadb from '../../../lib/prismadb'
import { router, privateProcedure } from '../../../lib/trpc'
import { exorcise } from './exorcise'
import { light } from './light'
import { ServiceItem } from '@prisma/client'
import { z } from 'zod'

export const service = router({
  light,
  exorcise,

  getServices: privateProcedure
    .input(
      z.object({
        year: z.number(),
        believerId: z.string(),
        serviceId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { year, believerId, serviceId } = input

      const { parent, data: peopleList } = await getBelieverListById(believerId)

      //todo 要把當年度以創建的order取出來
      const service = await prismadb.service.findUnique({
        where: {
          id: serviceId,
        },
        select: {
          id: true,
          category: true,
          serviceItems: {
            where: {
              year,
            },
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      })
      const items = service?.serviceItems || []

      const list = await Promise.all(
        peopleList.map(async (believer) => {
          const serviceItems: (Pick<ServiceItem, 'id' | 'name' | 'price'> & { isOrder: boolean })[] = []
          for (const serviceItem of items) {
            const order = await prismadb.order.findFirst({
              where: {
                believerId: believer.id,
                serviceItemId: serviceItem.id,
              },
            })
            const isOrder = !!order
            serviceItems.push({
              ...serviceItem,
              isOrder,
            })
          }

          return {
            ...believer,
            serviceItems,
          }
        })
      )
      return { parent, list }
    }),
})
