import { useUpdateEffect } from '@/hooks/useHook'
import { useRouter } from '@/hooks/useRouter'
import { cn } from '@/lib/utils'
import { useTheme } from '@/store/useTheme'
import type { MenuProps } from 'antd'
import { Image, Menu } from 'antd'
import { Resizable } from 're-resizable'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

interface SidebarProps {
  collapsed: boolean
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const { mode } = useTheme()
  const bgClass = mode === 'dark' ? 'bg-dark' : 'bg-white'
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { menu, keyArr } = useRouter()

  const [selectKeys, setSelectKeys] = useState<string[]>([pathname])
  const [openKeys, setOpenKeys] = useState<string[]>([
    pathname.replace(/\/[^/]*$/, '/layout'),
  ])
  const [width, setWidth] = useState(80)
  const handleOpenChange: MenuProps['onOpenChange'] = (keys: string[]) => {
    const key = [keys[keys.length - 1]]
    setOpenKeys(key)
  }
  const handleLink: MenuProps['onClick'] = (e) => {
    navigate(e.key)
    setSelectKeys([e.key] as string[])
  }
  useUpdateEffect(() => {
    if (!keyArr.includes(pathname)) {
      return
    }
    setSelectKeys([pathname] as string[])
  }, [pathname])
  useEffect(() => {
    if (!collapsed) {
      setWidth(250)
    }
  }, [collapsed])
  return (
    <>
      <Resizable
        className={cn(
          'overflow-y-scroll pr-2 duration-300 ease-in-out scrollbar-none',
          bgClass,
        )}
        size={{
          width: collapsed ? 80 : width,
          height: '100vh',
        }}
        onResizeStop={(e, direction, ref, d) => {
          setWidth((prev) => prev + d.width)
        }}
      >
        <Link to={'/setting'}>
          <div
            className={cn(
              'sticky top-0 z-10 flex h-16 items-center justify-center gap-3   ',
              bgClass,
            )}
          >
            <Image
              width={50}
              className="rounded-md"
              src="/images/sidebarImg.jpeg"
              alt=""
            />
            {!collapsed && (
              <div
                className={cn(
                  'break-keep',
                  mode === 'dark' ? ' text-light' : ' text-dark',
                )}
              >
                海光宮
              </div>
            )}
          </div>
        </Link>

        <Menu
          inlineCollapsed={collapsed}
          onClick={handleLink}
          onOpenChange={handleOpenChange}
          mode="inline"
          theme={mode}
          selectedKeys={selectKeys}
          openKeys={openKeys}
          items={menu}
        />
      </Resizable>
    </>
  )
}

export default Sidebar
