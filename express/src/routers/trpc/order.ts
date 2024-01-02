import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { ServiceItemDetail } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import dayjs from 'dayjs'
import { z } from 'zod'

export const order = router({
  createOrder: privateProcedure
    .input(
      z.object({
        believerId: z.string(),
        serviceItemIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { believerId, serviceItemIds } = input
      const userId = ctx.user?.id as string
      for (const serviceItemId of serviceItemIds) {
        const serviceItem = await prismadb.serviceItem.findUnique({
          where: {
            id: serviceItemId,
          },
          select: {
            id: true,
            price: true,
            year: true,
          },
        })
        if (serviceItem === null) {
          console.log('找不到服務項目')
          continue
        }

        const detail = await prismadb.serviceItemDetail.findFirst({
          where: {
            serviceItemId,
            end: {
              gt: prismadb.serviceItemDetail.fields.current,
            },
          },
          orderBy: {
            rank: 'asc',
          },
        })
        if (detail === null) {
          console.log('燈座沒位置了')
          continue
        }
        const { name, current } = await prismadb.serviceItemDetail.update({
          where: {
            id: detail.id,
          },
          data: {
            current: {
              increment: 1,
            },
          },
        })
        const position = `${name}-${current}`

        await prismadb.order.create({
          data: {
            userId,
            believerId,
            serviceItemId: serviceItem.id,
            price: serviceItem.price,
            year: serviceItem.year,
            position,
          },
        })
      }
    }),
})
