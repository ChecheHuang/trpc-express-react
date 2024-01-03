import { flattenChildren } from '@/lib/utils'
import { trpcClient } from '@/provider/TrpcProvider'
import router from '@/router/router'

export type DisplayDataType = {
  id: string
  key: string
  path: string
  frontEndName: string
  backEndName: string
  isUpload: boolean
  parentPath: string
  children: DisplayDataType[]
}

export type RouteType = {
  path: string
  name: string
  children?: RouteType[]
}

export const getRoutes = async () => {
  const data = await trpcClient.dev.getRouters.query()
  const flattenRouter = flattenChildren(router[0].children!, [
    'element',
    'icon',
    'isHidden',
  ])
  const displayData = structuredRoutesFn<DisplayDataType>(
    flattenRouter.map(({ path, name: frontEndName }, index) => {
      const backEndItem = data.find((item) => item.path === path)
      const isUpload = !!backEndItem
      const backEndName = backEndItem?.name || ''
      const id = backEndItem?.id.toString() || ''
      return {
        key: `${index + 1}`,
        id,
        path,
        frontEndName,
        backEndName,
        isUpload,
      }
    }),
    true,
  )
  return displayData[0].children as DisplayDataType[]
}

export interface StruturedRouteType {
  path: string
  parentPath?: string
  children?: StruturedRouteType[]
}

export function structuredRoutesFn<T extends StruturedRouteType>(
  data: StruturedRouteType[],
  isAddParentPath = false,
): T[] {
  const success = data.reduce(
    (result: StruturedRouteType[], item: StruturedRouteType) => {
      const { path, ...rest } = item
      const pathParts = path.split('/').filter((part: string) => part !== '')
      const parent = pathParts.reduce(
        (parent: StruturedRouteType | null, part: string, index: number) => {
          const path = `/${pathParts.slice(0, index + 1).join('/')}`
          const existingPath = parent
            ? parent.children?.find(
                (child: StruturedRouteType) => child.path === path,
              )
            : result.find((child: StruturedRouteType) => child.path === path)

          if (existingPath) {
            return existingPath
          } else {
            const newPath: StruturedRouteType = {
              path,
              ...rest,
            }
            if (isAddParentPath) {
              newPath.parentPath = parent?.path
            }
            if (parent) {
              const parentChildren = parent.children || []
              parent.children = [...parentChildren, newPath]
            } else {
              result = [...result, newPath]
            }

            return newPath
          }
        },
        null,
      )

      return result
    },
    [],
  )
  return success as T[]
}
