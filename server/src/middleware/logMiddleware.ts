import { SERVER_ADDRESS } from '../server'
import chalk from 'chalk'
import { Request, Response, NextFunction } from 'express'

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = new Date()
  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')
  const hours = String(start.getHours()).padStart(2, '0')
  const minutes = String(start.getMinutes()).padStart(2, '0')
  const seconds = String(start.getSeconds()).padStart(2, '0')
  const reqUrl = req.originalUrl || req.url
  const method = req.method
  const [path, query] = reqUrl.split('?')
  const queryString = query ? `?${query}` : '' // 处理没有查询参数的情况
  console.log(`${method.padStart(6, ' ')} ${SERVER_ADDRESS}${chalk.yellowBright(path)}${queryString}`)

  res.on('finish', () => {
    const end = new Date()
    const duration = end.getTime() - start.getTime()
    // console.log(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${method} ${SERVER_ADDRESS}${reqUrl} 計時${duration}毫秒`)
  })
  next()
}

export default logMiddleware
