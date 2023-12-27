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
    _page: z.string(),
    _limit: z.string(),
    orderValue: z.enum(['asc', 'desc']),
  })
)

const select = {
  id: true,
  name: true,
  gender: true,
  birthday: true,
  phone: true,
  city: true,
  area: true,
  address: true,
}

export const believer = router({
  createBeliever: privateProcedure
    .input(
      z.array(
        z.object({
          isParent: z.boolean(),
          name: z.string(),
          gender: z.string(),
          birthday: z.string(),
          phone: z.string(),
          city: z.string(),
          area: z.string(),
          address: z.string(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      const parentData = input.find((item) => item.isParent)
      const childrenData = input.filter((item) => !item.isParent)
      if (!parentData) throw new TRPCError({ code: 'BAD_REQUEST', message: '格是錯誤' })
      const { isParent, ...data } = parentData
      const parent = await prismadb.believer.create({
        data: {
          ...data,
          birthday: new Date(parentData.birthday),
          createdUserId: ctx.user.id,
        },
      })
      const parentId = parent.id
      for (const { isParent, ...child } of childrenData) {
        await prismadb.believer.create({
          data: {
            ...child,
            birthday: new Date(child.birthday),
            parentId,
            createdUserId: ctx.user.id,
          },
        })
      }
    }),
  getBelievers: paginationProcedure
    .input(
      z.object({
        orderKey: z.enum(['id', 'address']),
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        area: z.string().optional(),
      })
    )
    .output(
      z.object({
        data: z.array(
          z.object({
            parentId: z.string().nullable(),
            id: z.string(),
            key: z.string(),
            name: z.string(),
            gender: z.string(),
            birthday: z.string(),
            phone: z.string(),
            city: z.string(),
            area: z.string(),
            address: z.string(),
          })
        ),
        total: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { _limit, _page, orderValue } = input
      const { orderKey, name, address, phone, city, area } = input

      const where = {
        name: name ? { contains: name } : undefined,
        phone: phone ? { contains: phone } : undefined,
        address: address ? { contains: address } : undefined,
        city: city ? { contains: city } : undefined,
        area: area ? { contains: area } : undefined,
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
        orderKey: z.enum(['id', 'address']),
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        area: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { _limit, _page, orderValue } = input
      const { orderKey, name, address, phone, city, area } = input

      const where = {
        parentId: null,
        name: name ? { contains: name } : undefined,
        phone: phone ? { contains: phone } : undefined,
        address: address ? { contains: address } : undefined,
        city: city ? { contains: city } : undefined,
        area: area ? { contains: area } : undefined,
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
  getBelieverById: privateProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input
    const data = await prismadb.believer.findUnique({
      select: {
        ...select,
        parent: {
          select: {
            ...select,
            children: {
              select,
              where: {
                id: {
                  not: id,
                },
              },
            },
          },
        },
        children: {
          select,
        },
      },
      where: {
        id,
      },
    })

    if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該客戶' })
    const { birthday, children, parent, ...believer } = data

    if (parent === null) {
      const result = [
        {
          ...believer,
          isParent: true,
          birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
        },
        ...children.map(({ birthday, ...child }) => ({
          ...child,
          isParent: false,
          birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
        })),
      ]
      return result
    }

    const result = {
      ...believer,
      birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
    }
    return result
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
      //todo 如果要改戶長

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
  deleteBeliever: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const { id } = input
    await prismadb.believer.delete({
      where: {
        id,
      },
    })
  }),
})
