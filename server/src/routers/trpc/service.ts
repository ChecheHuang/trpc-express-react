import { getBelieverListById } from '../../lib/cusFn/getBelieverListById'
import prismadb from '../../lib/prismadb'
import { router, privateProcedure } from '../../lib/trpc'
import { ServiceItem } from '@prisma/client'
import dayjs from 'dayjs'
import { z } from 'zod'

export const service = router({
  getServiceByCategory: privateProcedure.input(z.string()).query(async ({ input: category }) => {
    const serviceId = (
      await prismadb.service.findUnique({
        where: {
          category,
        },
      })
    )?.id as string
    const year = dayjs().year() - 1911

    const service = await prismadb.serviceItem.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        serviceItemDetails: {
          select: {
            id: true,
            rank: true,
            name: true,
            start: true,
            end: true,
          },
        },
      },
      where: {
        year,
        serviceId,
      },
    })

    const result = service.map(({ serviceItemDetails, ...item }) => {
      return { current: '', details: serviceItemDetails, ...item }
    })

    return result
  }),
  createByCategory: privateProcedure
    .input(z.object({ category: z.string(), name: z.string(), price: z.number() }))
    .mutation(async ({ input: { category, name, price } }) => {
      const serviceId = (
        await prismadb.service.findUnique({
          where: {
            category,
          },
        })
      )?.id as string
      const year = dayjs().year() - 1911

      await prismadb.serviceItem.create({
        data: {
          name,
          price,
          serviceId,
          year,
        },
      })
    }),
  update: privateProcedure
    .input(z.object({ id: z.string(), name: z.string(), price: z.number() }))
    .mutation(async ({ input }) => {
      await prismadb.serviceItem.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
        },
      })
    }),
  delete: privateProcedure.input(z.string()).mutation(async ({ input }) => {
    await prismadb.serviceItem.delete({
      where: {
        id: input,
      },
    })
  }),
  createDetail: privateProcedure
    .input(z.object({ serviceItemId: z.string(), name: z.string(), start: z.number(), end: z.number() }))
    .mutation(async ({ input }) => {
      const lastRank = await prismadb.serviceItemDetail.findFirst({
        where: {
          serviceItemId: input.serviceItemId,
        },
        orderBy: {
          rank: 'desc',
        },
        select: {
          rank: true,
        },
      })
      await prismadb.serviceItemDetail.create({
        data: {
          rank: lastRank ? lastRank.rank + 1 : 1,
          name: input.name,
          start: input.start,
          end: input.end,
          serviceItemId: input.serviceItemId,
        },
      })
    }),
  updateDetail: privateProcedure
    .input(z.object({ id: z.string(), name: z.string(), start: z.number(), end: z.number() }))
    .mutation(async ({ input }) => {
      await prismadb.serviceItemDetail.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          start: input.start,
          end: input.end,
        },
      })
    }),
  deleteDetail: privateProcedure.input(z.string()).mutation(async ({ input }) => {
    await prismadb.serviceItemDetail.delete({
      where: {
        id: input,
      },
    })
  }),
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
