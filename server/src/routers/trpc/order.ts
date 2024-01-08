import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { Mutex, withTimeout } from 'async-mutex'
import { z } from 'zod'

const mutexWithTimeout = withTimeout(new Mutex(), 5000, new Error('請稍待再試'))

export const order = router({
  getPrints: privateProcedure.query(async () => {
    const prints = await prismadb.print.findMany({
      select: {
        id: true,
        rank: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            printId: true,
            year: true,
            price: true,
            position: true,
            believer: {
              select: {
                id: true,
                name: true,
              },
            },
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
        },
      },
    })
    const updatedData = prints.map((item) => {
      const totalPrice = item.orders.reduce((acc, order) => {
        return acc + order.price
      }, 0)

      return {
        ...item,
        key: item.id,
        totalPrice,
        orders: item.orders.map((order) => {
          return {
            ...order,
            key: order.id,
          }
        }),
      }
    })
    return updatedData
  }),

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
        const newOrder = await mutexWithTimeout.runExclusive(async () => {
          const totalOrder: {
            serviceItem: {
              service: {
                category: string
              }
              name: string
            }
            price: number
            position: string
            printId: string
          }[] = []
          await prismadb.$transaction(async (prismadb) => {
            const printId = (
              await prismadb.print.create({
                data: {},
              })
            ).id
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
                    believer: {
                      select: {
                        id: true,
                        name: true,
                        address: true,
                      },
                    },
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
              printId: string
            }[]
          )
          return orders
        })

        return newOrder
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    }),
})
