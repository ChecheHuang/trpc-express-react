import { getBelieverListById } from '../../lib/cusFn/getBelieverListById'
import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import dayjs from 'dayjs'
import { z } from 'zod'

type Parent = {
  children?: Parent[]
} & {
  path: string
  name: string
}

const routeSchema: z.ZodType<Parent> = z
  .object({
    path: z.string(),
    name: z.string(),
  })
  .and(
    z.object({
      children: z
        .lazy(() => routeSchema)
        .array()
        .optional(),
    })
  )

const paginationProcedure = privateProcedure.input(
  z.object({
    _page: z.string().optional().default('1'),
    _limit: z.string().optional().default('10'),
    orderValue: z.enum(['asc', 'desc']).optional().default('asc'),
  })
)

const select = {
  id: true,
  rank: true,
  name: true,
  gender: true,
  birthday: true,
  phone: true,
  address: true,
}

export const believer = router({
  searchBeliever: procedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        address: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { name, phone, address } = input
      // if (!name && !phone && !address) {
      //   return []
      // }

      const where = {
        name: name ? { contains: name } : undefined,
        phone: phone ? { contains: phone } : undefined,
        address: address ? { contains: address } : undefined,
      }

      const data = await prismadb.believer.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
        },
        where,
      })
      const result = data.map((item) => {
        return {
          key: item.id,
          ...item,
        }
      })
      return result
    }),

  changeParentIdByBelieverId: procedure.input(z.string()).mutation(async ({ input }) => {
    const data = await prismadb.believer.findUnique({
      where: {
        id: input,
      },
      select: {
        id: true,
        name: true,
        parent: {
          select: {
            id: true,
            children: {
              select: {
                id: true,
              },
              where: {
                id: {
                  not: input,
                },
              },
            },
          },
        },
      },
    })
    if (!data) throw new TRPCError({ code: 'BAD_REQUEST', message: '找不到會員' })

    if (data.parent === null) {
      return
    }

    const newParent = await prismadb.believer.update({
      where: {
        id: input,
      },
      data: {
        parentId: null,
      },
      select: {
        id: true,
      },
    })
    const familyIds = [...data.parent.children.map((item) => item.id), data.parent.id]
    for (const id of familyIds) {
      await prismadb.believer.update({
        where: {
          id,
        },
        data: {
          parentId: newParent.id,
        },
      })
    }
  }),

  createBeliever: privateProcedure
    .input(
      z.object({
        parentId: z.string().nullable(),
        name: z.string(),
        gender: z.string(),
        birthday: z.string(),
        phone: z.string(),
        address: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { birthday, ...data } = input
      const newBeliever = await prismadb.believer.create({
        data: {
          ...data,
          birthday: new Date(birthday),
          createdUserId: ctx.user.id,
        },
        select: {
          id: true,
          name: true,
        },
      })
      return newBeliever
    }),
  getBelievers: paginationProcedure
    .input(
      z.object({
        orderKey: z.enum(['rank', 'address']).optional().default('rank'),
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .output(
      z.object({
        data: z.array(
          z.object({
            parentId: z.string().nullable(),
            id: z.string(),
            key: z.string(),
            rank: z.number(),
            name: z.string(),
            gender: z.string(),
            birthday: z.string(),
            phone: z.string(),
            address: z.string(),
          })
        ),
        total: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { _limit, _page, orderValue } = input
      const { orderKey, name, address, phone } = input

      const where = {
        name: name ? { contains: name } : undefined,
        phone: phone ? { contains: phone } : undefined,
        address: address ? { contains: address } : undefined,
      }
      const take = parseInt(_limit)
      const skip = (parseInt(_page) - 1) * take
      const orderBy = {
        [orderKey]: orderValue,
      }

      const total = await prismadb.believer.count({
        where,
      })

      const believers = (
        await prismadb.believer.findMany({
          select: { parentId: true, ...select },
          take,
          skip,
          orderBy,
          where,
        })
      ).map(({ birthday, ...believer }) => ({
        key: believer.id,
        ...believer,
        birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
      }))
      const result = {
        total,
        data: believers,
      }
      return result
    }),
  getBelieversByFamily: paginationProcedure
    .input(
      z.object({
        orderKey: z.enum(['rank', 'address']),
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { _limit, _page, orderValue } = input
      const { orderKey, name, address, phone } = input

      const where = {
        parentId: null,
        name: name ? { contains: name } : undefined,
        phone: phone ? { contains: phone } : undefined,
        address: address ? { contains: address } : undefined,
      }
      const take = parseInt(_limit)
      const skip = (parseInt(_page) - 1) * take
      const orderBy = {
        [orderKey]: orderValue,
      }

      const total = await prismadb.believer.count({
        where,
      })

      const believers = (
        await prismadb.believer.findMany({
          select: {
            ...select,
            children: {
              select,
            },
          },
          take,
          skip,

          orderBy,
          where,
        })
      ).map(({ birthday, children, ...believer }) => ({
        key: believer.id,
        ...believer,
        birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
        children: children.map(({ birthday, ...child }) => ({
          key: child.id,
          ...child,
          birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
        })),
      }))
      const result = {
        total,
        data: believers,
      }
      return result
    }),
  getBelieverById: privateProcedure.input(z.string()).query(async ({ input }) => {
    const data = await getBelieverListById(input)
    return data
  }),
  updateBeliever: privateProcedure
    .input(
      z.object({
        id: z.string(),
        birthday: z.string(),
        name: z.string(),
        gender: z.string(),
        phone: z.string(),
        address: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, birthday, ...data } = input
      await prismadb.believer.update({
        where: {
          id,
        },
        data: {
          ...data,
          birthday: new Date(birthday),
        },
      })
    }),
  changeBelieverParent: privateProcedure
    .input(z.object({ id: z.string(), currentBelieverId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const { id, currentBelieverId } = input
      if (!currentBelieverId) {
        await prismadb.believer.update({
          where: {
            id,
          },
          data: {
            parentId: null,
          },
        })
        return
      }
      const currentBeliever = await prismadb.believer.findUnique({
        where: {
          id: currentBelieverId,
        },
        select: {
          id: true,
          parentId: true,
        },
      })
      const parentId = currentBeliever?.parentId || currentBeliever?.id
      await prismadb.believer.update({
        where: {
          id,
        },
        data: {
          parentId,
        },
      })
      return
    }),
  deleteBeliever: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const { id } = input
    await prismadb.believer.delete({
      where: {
        id,
      },
    })
  }),
})
