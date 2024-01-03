import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const temple = router({
  getTemple: procedure.query(async () => {
    const temple = await prismadb.temple.findFirst({
      select: {
        name: true,
        phone: true,
        address: true,
        principal: true,
        wordsOfThanksForService: true,
        wordsOfThanksForDonation: true,
      },
    })
    if (temple === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '找不到寺院資料',
      })
    }
    return temple
  }),
  updateTemple: privateProcedure
    .input(
      z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        principal: z.string().optional(),
        wordsOfThanksForService: z.string().optional(),
        wordsOfThanksForDonation: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const temple = await prismadb.temple.updateMany({
        data: input,
      })
    }),
})
