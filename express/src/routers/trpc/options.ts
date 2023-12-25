import prismadb from '../../lib/prismadb'
import { router, procedure, privateProcedure } from '../../lib/trpc'
import { z } from 'zod'

export const options = router({
  cityOptions: procedure.query(async () => {
    const citys = await prismadb.taiwanCity.findMany()

    const result = citys.map((city) => {
      const areas = city.areas as string[]

      return {
        value: city.name,
        label: city.name,
        children: areas.map((area) => ({
          value: area,
          label: area,
        })),
      }
    })
    return result
  }),
})
