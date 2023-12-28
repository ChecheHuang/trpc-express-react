import prismadb from '../prismadb'
import { TRPCError } from '@trpc/server'

export const getBelieverListById = async (id: string) => {
  const select = {
    id: true,
    rank: true,
    name: true,
    gender: true,
    birthday: true,
    phone: true,
    city: true,
    area: true,
    address: true,
  }
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
  const { parent, children, ...currentUser } = data
  if (parent === null) {
    const result = [{ ...currentUser, isParent: false }, ...children.map((child) => ({ ...child, isParent: false }))]
    return result
  }
  const { children: currentUserParentChildren, ...currentUserParent } = parent
  const result = [
    { ...currentUser, isParent: false },
    { ...currentUserParent, isParent: true },
    ...currentUserParentChildren.map((child) => ({ ...child, isParent: false })),
  ]
  return result
}
