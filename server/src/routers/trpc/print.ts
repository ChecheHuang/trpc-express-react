import prismadb from '../../lib/prismadb';
import { router, procedure, privateProcedure } from '../../lib/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';


export const print = router({
  getPrints: privateProcedure
    .query(async () => {
      const totalOrders = await prismadb.order.findMany()
      console.log(totalOrders)
      return totalOrders
    })
})