import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
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
        console.log(serviceItemId)
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
          console.log('哪裡出問題了')
          continue
        }
        await prismadb.order.create({
          data: {
            userId,
            believerId,
            serviceItemId: serviceItem.id,
            price: serviceItem.price,
            year: serviceItem.year,
          },
        })
      }
    }),
})
