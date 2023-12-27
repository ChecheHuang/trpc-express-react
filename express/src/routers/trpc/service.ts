import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import dayjs from 'dayjs'
import { z } from 'zod'

export const service = router({
  getLights: privateProcedure.query(async () => {
    const serviceId = (
      await prismadb.service.findUnique({
        where: {
          category: '點燈',
        },
      })
    )?.id as string
    const year = dayjs().year() - 1911

    const lightService = await prismadb.serviceItem.findMany({
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
      },
    })

    const result = lightService.map(({ serviceItemDetails, ...item }) => {
      const lightDetails = serviceItemDetails.map(({ ...item }) => ({ key: item.id, ...item }))
      return { key: item.id, current: '', lightDetails, ...item }
    })

    return result
  }),
  createLight: privateProcedure.input(z.object({ name: z.string(), price: z.number() })).mutation(async ({ input }) => {
    const serviceId = (
      await prismadb.service.findUnique({
        where: {
          category: '點燈',
        },
      })
    )?.id as string
    const year = dayjs().year() - 1911

    const lightService = await prismadb.serviceItem.create({
      data: {
        name: input.name,
        price: input.price,
        serviceId,
        year,
      },
    })
  }),
  updateLight: privateProcedure
    .input(z.object({ id: z.string(), name: z.string(), price: z.number() }))
    .mutation(async ({ input }) => {
      const serviceId = (
        await prismadb.service.findUnique({
          where: {
            category: '點燈',
          },
        })
      )?.id as string
      const year = dayjs().year() - 1911

      const lightService = await prismadb.serviceItem.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
          serviceId,
          year,
        },
      })
    }),
  deleteLight: privateProcedure.input(z.string()).mutation(async ({ input }) => {
    await prismadb.serviceItem.delete({
      where: {
        id: input,
      },
    })
  }),
  createLightDetail: privateProcedure
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
      const currentRank = lastRank ? lastRank.rank + 1 : 1

      const lightService = await prismadb.serviceItemDetail.create({
        data: {
          rank: currentRank,
          name: input.name,
          start: input.start,
          end: input.end,
          serviceItemId: input.serviceItemId,
        },
      })
    }),
  updateLightDetail: privateProcedure
    .input(z.object({ id: z.string(), name: z.string(), start: z.number(), end: z.number() }))
    .mutation(async ({ input }) => {
      const lightService = await prismadb.serviceItemDetail.update({
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
  deleteLightDetail: privateProcedure.input(z.string()).mutation(async ({ input }) => {
    await prismadb.serviceItemDetail.delete({
      where: {
        id: input,
      },
    })
  }),
  getServices: privateProcedure.query(async () => {
    const service = await prismadb.service.findMany({
      select: {
        id: true,
        category: true,
        serviceItems: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    const result = service.map((item) => ({
      key: item.id,
      ...item,
    }))

    return result
  }),
})
