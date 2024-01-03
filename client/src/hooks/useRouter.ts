import { generateRegexPath } from '@/config/regex'
import router from '@/router/router'
import { UserStoreType, useUserStore } from '@/store/useUser'
import type { MenuProps } from 'antd'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

type Route = GetArrType<typeof router>
type MenuItem = Required<MenuProps>['items'][number] & {
  children?: MenuItem[]
}

export const useRouter = () => {
  const { pathname: currentPath } = useLocation()
  const { routes } = useUserStore()

  //給Sidebar使用
  const { menu, keyArr } = useMemo(() => {
    const settIngRouter = router.find(({ path }) => path === '/setting')
      ?.children as Route[]
    const { menu, keyArr } = convertRoutesToMenu(settIngRouter, routes)
    return { menu, keyArr }
  }, [routes])

  //給Breadcrumb使用
  const pathSnippets = currentPath.split('/').filter((i) => i)
  const flattenedRouter = useMemo(() => {
    const map = new Map<RegExp, { name: string }>()
    if (!routes) return map
    for (const { name, path, isAllow } of routes) {
      if (!isAllow) continue
      map.set(path, { name })
    }
    return map
  }, [routes])
  const extraBreadcrumb = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
    const name = getValueByPath(flattenedRouter, url)
    return {
      url,
      name,
    }
  })

  //給BeforeChangeRoute使用
  const isAllowEnter = useMemo(() => {
    if (!routes) return false
    const routeObj = routes.find(({ path }) => path.test(currentPath))
    if (!routeObj) return true
    return routeObj.isAllow
  }, [currentPath, routes])

  return { isAllowEnter, extraBreadcrumb, menu, keyArr }
}

function flattenChildren<T extends { path?: string; children?: T[] }>(
  flattenArray: T[],
  propertiesToRemove: (keyof Omit<T, 'children'>)[] = [],
): Omit<T, 'children'>[] {
  const result: Omit<T, 'children'>[] = []
  for (const { children, ...rest } of flattenArray) {
    const updatedRest = { ...rest }
    for (const property of propertiesToRemove) {
      delete updatedRest[property]
    }
    result.push(updatedRest as Omit<T, 'children'>)
    if (children) {
      result.push(...flattenChildren(children, propertiesToRemove))
    }
  }
  return result
}
function getValueByPath(
  map: Map<RegExp, { name: string }>,
  path: string,
): string {
  for (const [regex, value] of map.entries()) {
    if (regex.test(path)) return value.name
  }
  const frontEndRoutes = flattenChildren(router, ['element', 'icon']).map(
    ({ path, ...route }) => {
      return { path: generateRegexPath(path), ...route }
    },
  )
  for (const { path: regexPath, name } of frontEndRoutes) {
    if (new RegExp(regexPath).test(path)) return name
  }
  return ''
}

function convertRoutesToMenu(
  routes: Route[],
  regexObjArr: Required<UserStoreType>['routes'] = [],
): {
  menu: MenuItem[]
  keyArr: string[]
} {
  let keyArr: string[] = []
  const menu = routes.reduce<MenuItem[]>((menu, route) => {
    const backEndRoute = regexObjArr.find(({ path: regex }) =>
      regex.test(route.path),
    )
    // if (!backEndRoute) return menu
    if (backEndRoute?.isAllow === false) {
      return menu
    }
    if (route.isHidden || route.path.includes(':')) {
      return menu
    }
    if (route.path === '/setting/dev') {
      return menu
    }

    const { path, icon, children } = route
    const menuItem: MenuItem = {
      key: children ? path + '/layout' : path,
      icon,
      label: backEndRoute?.name ? backEndRoute.name : route.name,
    }
    if (children) {
      const result = convertRoutesToMenu(children, regexObjArr)
      menuItem.children = result.menu
      keyArr = [...keyArr, ...result.keyArr]
    }
    if (!children) {
      keyArr = [...keyArr, path]
    }

    return [...menu, menuItem]
  }, [])
  if (import.meta.env.MODE !== 'production') {
    const devRoute = routes.find(({ path }) => path === '/setting/dev')
    if (devRoute) {
      menu.push({
        key: '/setting/dev',
        icon: devRoute.icon,
        label: devRoute.name,
      })
    }
  }

  return { menu, keyArr }
}
