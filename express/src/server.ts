import './lib/plugin'
import { Context, createContext } from './lib/trpc'
import { getLocalIP } from './lib/utils'
import logMiddleware from './middleware/logMiddleware'
import apiRouter from './routers/api'
import { trpcRouter } from './routers/trpc'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import chalk from 'chalk'
import cors from 'cors'
import dotenv from 'dotenv'
import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import http from 'http'
import createError from 'http-errors'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { createOpenApiExpressMiddleware } from 'trpc-openapi'
import { generateOpenApiDocument } from 'trpc-openapi'
import { Server } from 'ws'

dotenv.config({ path: './.env' })

const port = process.env.PORT

export const SERVER_ADDRESS = `http://${getLocalIP()}:${port}`
const SWAGGER_PREFIX = '/swagger_api'

async function startServer() {
  const app = express()
  // app.use(cors())
  const server = http.createServer(app)
  app.use(logMiddleware)

  //todo Handle incoming API requests
  app.use('/api', apiRouter)

  //todo Handle incoming TRPC requests
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: trpcRouter,
      createContext,
    })
  )

  //todo Handle incoming WebSocket requests
  const wss = new Server({ server })

  const wsHandler = applyWSSHandler({
    wss,
    router: trpcRouter,
    createContext: () => ({}) as Context,
  })

  //todo Handle incoming OpenAPI requests
  app.use(SWAGGER_PREFIX, createOpenApiExpressMiddleware({ router: trpcRouter, createContext }))

  // Generate OpenAPI schema document
  const openApiDocument = generateOpenApiDocument(trpcRouter, {
    title: ' TRPC API',
    description: 'OpenAPI compliant REST API built using tRPC with Express',
    version: '1.0.0',
    baseUrl: SERVER_ADDRESS + SWAGGER_PREFIX,
    docsUrl: 'https://github.com/jlalmes/trpc-openapi',
    tags: [],
  })

  // Serve Swagger UI with our OpenAPI schema
  app.use('/swagger', swaggerUi.serve)
  app.get('/swagger', swaggerUi.setup(openApiDocument))

  // Serve static files
  const publicPath = path.join(path.resolve(__dirname, '..'), '/public')
  app.use(express.static(publicPath))
  app.get('/*', function (req, res) {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
  // catch 404 and forward to error handler
  app.use((req: Request, res: Response, next: NextFunction) => next(createError(404, 'Endpoint not found')))

  // error handler
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.log('----------------------------------------------------------------')
    console.error(err)
    let errorMessage = 'An unknown error occurred: '
    let statusCode = 500
    if (err instanceof createError.HttpError) {
      statusCode = err.status
      errorMessage = err.message
    }
    res.status(statusCode).json({ error: errorMessage })
  })

  server.listen(port, () => {
    console.log(chalk.greenBright(`😼[server] :${SERVER_ADDRESS}`))
    console.log(chalk.blue(`😽[swagger]:${SERVER_ADDRESS}/swagger`))
  })
  server.on('error', console.error)

  process.on('SIGTERM', () => {
    wsHandler.broadcastReconnectNotification()
    wss.close()
    server.close()
  })
}

startServer()
