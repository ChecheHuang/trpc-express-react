import { trpcRouter } from '../src/routers/trpc'
import believers from './believers.json'
import routes from './routes.json'
import services from './services.json'
import taiwanCity from './taiwanCity.json'
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import chalk from 'chalk'

const prismadb = new PrismaClient()

const deleteData = async () => {
  await prismadb['taiwanCity'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE taiwanCity AUTO_INCREMENT = 1;`
  await prismadb['believer'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE believer AUTO_INCREMENT = 1;`
  await prismadb['role'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE role AUTO_INCREMENT = 1;`
  await prismadb['user'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE user AUTO_INCREMENT = 1;`
  await prismadb['api'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE user AUTO_INCREMENT = 1;`
  await prismadb['route'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE route AUTO_INCREMENT = 1;`
  await prismadb['service'].deleteMany()
  await prismadb.$queryRaw`ALTER TABLE service AUTO_INCREMENT = 1;`
  // await prismadb['order'].deleteMany()
  // await prismadb.$queryRaw`ALTER TABLE order AUTO_INCREMENT = 1;`
}

const init = async () => {
  //todo 創建台灣地區資料
  const taiwanCitySeed = await (async () => {
    const data = Object.entries(taiwanCity)
    for (const [name, areas] of data) {
      await prismadb.taiwanCity.create({
        data: {
          name,
          areas,
        },
      })
    }
  })()

  //todo 創建api
  const apisSeed = await (async () => {
    const data = Object.entries(trpcRouter._def.procedures).map(([key, value]) => {
      const router = key.split('.')[0]
      const name = key.split('.')[1]
      const ignoreTypeValue = value as any
      const { meta } = ignoreTypeValue
      const swaggerInfo = {
        swaggerMethod: meta?.openapi?.method || '',
        swaggerPath: meta?.openapi?.path || '',
        swaggerTags: meta?.openapi?.tags || [],
        swaggerSummary: meta?.openapi?.summary || '',
        swaggerDescription: meta?.openapi?.description || '',
        swaggerProtect: meta?.openapi?.protect || false,
      }

      return { router, name, ...swaggerInfo }
    })

    await prismadb.api.createMany({
      data,
    })
  })()

  //todo 創建角色及用戶
  const rolesAndUsersSeed = await (async () => {
    const apis = await prismadb.api.findMany()
    const roles = ['superadmin', 'admin', 'user']
    for (const role of roles) {
      const createdRole = await prismadb.role.create({
        data: {
          role,
          rolesOnApis: {
            create: apis.map((api) => ({ apiId: api.id })),
          },
        },
      })
      await prismadb.user.create({
        data: {
          name: '我是' + role,
          password: await bcrypt.hash('password', 12),
          rolesOnUsers: {
            create: {
              role: {
                connect: {
                  id: createdRole.id,
                },
              },
            },
          },
        },
      })
    }
  })()

  //todo 創建路由
  const routeSeed = await (async () => {
    const data = routes[0]
    await prismadb.route.create({
      data,
    })
  })()

  //todo 創建角色與路由關聯
  const rolesOnRoutesSeed = await (async () => {
    const allRoutes = await prismadb.route.findMany()
    const allRoles = await prismadb.role.findMany()
    for (const { id: routeId } of allRoutes) {
      for (const { id: roleId } of allRoles) {
        const create = await prismadb.rolesOnRoutes.create({
          data: {
            routeId,
            roleId,
            isAllow: true,
          },
        })
      }
    }
  })()

  //todo 創建信眾資料
  const believerSeed = await (async () => {
    const createdUserId = (await prismadb.user.findFirst())?.id as string
    for (const { children: originChildren, birthday: originBirthday, ...rest } of believers) {
      await prismadb.believer.create({
        data: {
          createdUserId,
          birthday: new Date(originBirthday),
          children: {
            create: originChildren.map(({ birthday: originBirthday, ...rest }) => {
              return {
                createdUserId,
                birthday: new Date(originBirthday),
                ...rest,
              }
            }),
          },
          ...rest,
        },
      })
    }
  })()

  //todo 創建服務
  const serviceSeed = await (async () => {
    for (const data of services) {
      await prismadb.service.create({
        data,
      })
    }
  })()

  //todo 創建訂單
  const orderSeed = await (async () => {
    const userId = (await prismadb.user.findFirst())?.id as string
    const totalBelieverIds = (await prismadb.believer.findMany()).map((believer) => believer.id)
    const totalService = (
      await prismadb.serviceItem.findMany({
        select: {
          id: true,
          price: true,
          year: true,
        },
      })
    ).map((serviceItem) => {
      return {
        serviceItemId: serviceItem.id,
        price: serviceItem.price,
        year: serviceItem.year,
      }
    })
    for (const believerId of totalBelieverIds) {
      for (const service of totalService) {
        await prismadb.order.create({
          data: {
            userId,
            believerId,
            ...service,
          },
        })
      }
    }
  })()
}

async function main() {
  try {
    console.log(chalk.redBright(`Start delete`))
    await deleteData()
    console.log(chalk.blueBright('Start seeding ...'))
    await init()
    console.log(chalk.greenBright('Seeding finished ...'))
  } catch (err) {
    console.log(err)
  }
}

void main()
