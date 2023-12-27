import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { TRPCError } from '@trpc/server'
import dayjs from 'dayjs'
import { z } from 'zod'

export const order = router({
  createOrder: privateProcedure.query(async () => {
    
  })
    
})
