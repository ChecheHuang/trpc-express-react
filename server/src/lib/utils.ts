import { logserver } from './plugin'
import { Handler, Request, Response, NextFunction } from 'express'
import os from 'os'

type InputType = {
  id: number
  name: string
  path: string
  parentId: number | null
}
type OutputType = InputType & {
  children: OutputType[]
}
export function addChildrenToData(data: InputType[]): OutputType[] {
  const result: OutputType[] = []

  const nodeMap: { [id: number]: OutputType } = {}
  data.forEach((item) => {
    nodeMap[item.id] = { ...item, children: [] }
  })

  data.forEach((item) => {
    const parentId = item.parentId
    if (parentId === null) {
      result.push(nodeMap[item.id])
    } else if (Object.prototype.hasOwnProperty.call(nodeMap, parentId)) {
      if (nodeMap[parentId].children) {
        nodeMap[parentId].children.push(nodeMap[item.id])
      }
    }
  })

  return result
}

export interface CleanRouteType {
  path: string
  name: string
  children?: CleanRouteType[]
}
type SeedRouteType = Omit<CleanRouteType, 'children'> & {
  children?: { create: SeedRouteType[] }
  rolesOnRoutes?: {
    create: { roleId: string }[]
  }
}
export function makeSeedRoute(routes: CleanRouteType[]): SeedRouteType[] {
  return routes.map((route) => {
    const { path, name, children } = route

    const filteredRoute: SeedRouteType = {
      path,
      name,
    }

    if (children) {
      filteredRoute.children = {
        create: makeSeedRoute(children),
      }
    }

    return filteredRoute
  })
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
