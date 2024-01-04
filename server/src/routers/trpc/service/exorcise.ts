import prismadb from '../../../lib/prismadb';
import { router, privateProcedure } from '../../../lib/trpc';
import dayjs from 'dayjs';
import { z } from 'zod';


export const exorcise = router({
  getAll: privateProcedure.query(async () => {
    const serviceId = (
      await prismadb.service.findUnique({
        where: {
          category: '超渡',
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
  create: privateProcedure.input(z.object({ name: z.string(), price: z.number() })).mutation(async ({ input }) => {
    const serviceId = (
      await prismadb.service.findUnique({
        where: {
          category: '超渡',
        },
      })
    )?.id as string
    const year = dayjs().year() - 1911

    await prismadb.serviceItem.create({
      data: {
        name: input.name,
        price: input.price,
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
})