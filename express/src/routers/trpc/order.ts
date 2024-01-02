import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const order = router({
  createOrder: privateProcedure
    .input(
      z.array(
        z.object({
          believerId: z.string(),
          serviceItemIds: z.array(z.string()),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id as string
      try {
        let totalPrice = 0
        await prismadb.$transaction(async (prisma) => {
          for (const { believerId, serviceItemIds } of input) {

            
            for (const serviceItemId of serviceItemIds) {
              const serviceItem = await prisma.serviceItem.findUnique({
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
                throw new Error('找不到服務項目')
              }
              const detail = await prisma.serviceItemDetail.findFirst({
                where: {
                  serviceItemId,
                  end: {
                    gt: prisma.serviceItemDetail.fields.current,
                  },
                },
                orderBy: {
                  rank: 'asc',
                },
              })
              if (detail === null) {
                throw new Error('燈座沒位置了')
              }
              const { name, current } = await prisma.serviceItemDetail.update({
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
              const newOrder = await prisma.order.create({
                data: {
                  userId,
                  believerId,
                  serviceItemId: serviceItem.id,
                  price: serviceItem.price,
                  year: serviceItem.year,
                  position,
                },
              })
              totalPrice += newOrder.price
            }
          }
          return totalPrice
        })
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    }),
})
