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
    //自己就是戶長
    const data = [currentUser, ...children]

    const result = {
      parent: currentUser,
      data,
    }
    return result
  }
  const { children: currentUserParentChildren, ...currentUserParent } = parent
  const result = {
    parent: currentUserParent,
    data: [currentUserParent, currentUser, ...currentUserParentChildren],
  }
  return result
}
