import { logserver } from './plugin'
import { Handler, Request, Response, NextFunction } from 'express'
import os from 'os'

export const isDefined = <T>(value?: T): value is T => {
  return value !== null && value !== undefined
}

export function getLocalIP(): string {
  const interfaces = os.networkInterfaces()
  for (const devName in interfaces) {
    const iface = interfaces[devName] as os.NetworkInterfaceInfo[]
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i]!
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
  return 'localhost'
}

export const catchError = (asyncFn: Handler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await asyncFn(req, res, next)
  } catch (err) {
    next(err)
  }
}
export const wait = (number: number) => new Promise((resolve) => setTimeout(resolve, number))

export const log = logserver

export function processInput(input: string | object) {
  if (typeof input === 'string') {
    return JSON.parse(input)
  } else {
    return JSON.stringify(input)
  }
}
