import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { Mutex, withTimeout } from 'async-mutex'
import { z } from 'zod'

const mutexWithTimeout = withTimeout(new Mutex(), 5000, new Error('請稍待再試'))

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
      await mutexWithTimeout.runExclusive(async () => {})

      const userId = ctx.user?.id as string
      const lastRecord = await prismadb.order.findFirst({
        select: { printId: true },
        orderBy: {
          id: 'desc',
        },
      })
      const printId = lastRecord?.printId ? lastRecord.printId + 1 : 1
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
          printId: number
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
                  printId,
                  serviceItemId: serviceItem.id,
                  price: serviceItem.price,
                  year: serviceItem.year,
                  position,
                },
                select: {
                  price: true,
                  position: true,
                  printId: true,
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
              printId,
            }
          ) => {
            const existingItem = acc.find((item) => item.category === category && item.name === name)

            if (existingItem) {
              existingItem.count++
              existingItem.price += price
            } else {
              acc.push({ category, name, printId, count: 1, price })
            }

            return acc
          },
          [] as {
            category: string
            name: string
            count: number
            price: number
            printId: number
          }[]
        )
        // console.log(orders)
        return orders
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    }),
})
