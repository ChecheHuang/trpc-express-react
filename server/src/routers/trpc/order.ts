import prismadb from '../../lib/prismadb'
import { router, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { Mutex, withTimeout } from 'async-mutex'
import { z } from 'zod'

const mutexWithTimeout = withTimeout(new Mutex(), 5000, new Error('請稍待再試'))

export const order = router({
  getPrints: privateProcedure.query(async () => {
    const prints = await prismadb.print.findMany({
      orderBy: {
        createdAt: 'desc',
      },
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
                parentId: true,
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
      const year = item.orders[0].year
      const category = item.orders[0].serviceItem.service.category

      const nameMap: { [name: string]: boolean } = {}
      const names = item.orders
        .reduce((acc: string[], order) => {
          if (!nameMap[order.believer.name]) {
            nameMap[order.believer.name] = true
            acc.push(order.believer.name)
          }
          return acc
        }, [])
        .join('、')

      return {
        ...item,
        key: item.id,
        totalPrice,
        year,
        category,
        names,
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

  getPrintById: privateProcedure.input(z.string()).query(async ({ input }) => {
    const print = await prismadb.print.findUnique({
      where: {
        id: input,
      },
      select: {
        id: true,
        rank: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            year: true,
            price: true,
            believer: {
              select: {
                name: true,
                address: true,
                parentId: true,
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
    if (print === null) throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該筆資料' })
    let printAddress = ''
    let totalPrice = 0
    const orders = print.orders.reduce(
      (
        acc: {
          believer: string
          address: string
          year: number
          price: number
          serviceItems: {
            name: string
            service: string
          }[]
        }[],
        curr
      ) => {
        const existingBeliever = acc.find((item) => item.believer === curr.believer.name)
        const serviceItem = {
          name: curr.serviceItem.name,
          service: curr.serviceItem.service.category,
        }
        totalPrice += curr.price
        if (existingBeliever) {
          existingBeliever.serviceItems.push(serviceItem)
          existingBeliever.price += curr.price
          return acc
        }
        acc.push({
          believer: curr.believer.name,
          address: curr.believer.address,
          year: curr.year,
          price: curr.price,
          serviceItems: [serviceItem],
        })
        if (curr.believer.parentId === null) {
          printAddress = curr.believer.address
        }
        return acc
      },
      []
    )
    return { orders, printAddress, totalPrice, rank: print.rank, createdAt: print.createdAt }
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
        return await mutexWithTimeout.runExclusive(async () => {
          return await prismadb.$transaction(async (prismadb) => {
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

                await prismadb.order.create({
                  data: {
                    userId,
                    believerId,
                    printId,
                    serviceItemId: serviceItem.id,
                    price: serviceItem.price,
                    year: serviceItem.year,
                    position,
                  },
                })
              }
            }

            return printId
          })
        })
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }
    }),
})
