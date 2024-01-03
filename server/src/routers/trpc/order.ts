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
      const lastGroupId = await prismadb.order.findFirst({
        select: { groupId: true },
        orderBy: {
          id: 'desc',
        },
      })
      const groupId = lastGroupId?.groupId ? lastGroupId.groupId + 1 : 1
      try {
        const totalOrder: {
          serviceItem: {
            service: {
              category: string
            }
            name: string
          }
          price: number
          position: string
        }[] = []
        await prismadb.$transaction(async (prismadb) => {
          for (const { believerId, serviceItemIds } of input) {
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
                throw new Error('找不到服務項目')
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
                throw new Error('燈座沒位置了')
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

              const newOrder = await prismadb.order.create({
                data: {
                  userId,
                  believerId,
                  groupId,
                  serviceItemId: serviceItem.id,
                  price: serviceItem.price,
                  year: serviceItem.year,
                  position,
                },
                select: {
                  price: true,
                  position: true,
                  serviceItem: {
                    select: {
                      name: true,
                      service: {
                        select: {
                          category: true,
                        },
                      },
                    },
                  },
                },
              })
              totalOrder.push(newOrder)
            }
          }
        })
        const orders = totalOrder.reduce(
          (
            acc,
            {
              serviceItem: {
                service: { category },
                name,
              },
              price,
            }
          ) => {
            const existingItem = acc.find((item) => item.category === category && item.name === name)

            if (existingItem) {
              existingItem.count++
              existingItem.price += price
            } else {
              acc.push({ category, name, count: 1, price })
            }

            return acc
          },
          [] as {
            category: string
            name: string
            count: number
            price: number
          }[]
        )
        return orders
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    }),
})
