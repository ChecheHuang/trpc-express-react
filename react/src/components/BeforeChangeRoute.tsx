import Loading from '@/components/Loading'
import { generateRegexPath } from '@/config/regex'
import { usePrevious } from '@/hooks/useHook'
import { useRouter } from '@/hooks/useRouter'
import { storage } from '@/lib/storage'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { useCallback, useEffect, useState } from 'react'
import { To, useLocation, useNavigate } from 'react-router-dom'

const useBeforeChangeRoute = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, isLogin } = useUserStore()
  const { isAllowEnter } = useRouter()
  const { message } = useAntd()
  const { pathname: currentPath } = useLocation()
  const navigate = useNavigate()
  const prevPath = usePrevious(currentPath)

  const navigateAndToast = (url: To, info: string) => {
    navigate(url)
    message.info(info)
  }
  const isCurrentPathNotEqualLogin = currentPath !== '/login'

  const navigatePath =
    prevPath === undefined || prevPath === currentPath ? '/setting' : prevPath
  const hasJwt = !!storage.get('jwt')

  const fetchData = useCallback(
    async (set: typeof setUser) => {
      setIsLoading(true)
      try {
        const data = await trpcClient.auth.userInfo.query()
        const { routes, ...rest } = data
        const regexRoutes = [...routes]
          .sort((a, b) =>
            a.path.includes(':') && !b.path.includes(':')
              ? 1
              : !a.path.includes(':') && b.path.includes(':')
                ? -1
                : 0,
          )
          .map(({ path, ...rest }) => ({
            path: generateRegexPath(path),
            ...rest,
          }))
        const userInfo = {
          ...rest,
          routes: regexRoutes,
        }
        set(userInfo)
      } catch (error: any) {
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    },
    [setIsLoading, navigate],
  )

  const handleLoggedIn = () => {
    if (!isCurrentPathNotEqualLogin) navigateAndToast('/setting', '您已登入')
    if (currentPath === '/setting') return
    if (!isAllowEnter && isCurrentPathNotEqualLogin)
      navigateAndToast(navigatePath, '您沒有權限訪問此頁面')
  }
  const handleNotLoggedIn = async () => {
    if (!hasJwt && isCurrentPathNotEqualLogin)
      navigateAndToast('/login', '請先登入')
    if (hasJwt) await fetchData(setUser)
  }

  useEffect(() => {
    if (isLogin) return handleLoggedIn()
    handleNotLoggedIn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, isLogin])

  return { isLoading }
}

function BeforeChangeRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useBeforeChangeRoute()

  if (isLoading)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading />
      </div>
    )

  return <>{children}</>
}

export default BeforeChangeRoute
