import React, { createRef, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import MyFloatButton from '@/components/buttons/MyFloatButton'
import { useWindowInfo } from '@/hooks/useHook'
import { cn } from '@/lib/utils'
import ModalProvider from '@/provider/ModalProvider'
import { useTheme } from '@/store/useTheme'

import Header from './_components/Header'
import Sidebar from './_components/Sidebar'

const Layout = () => {
  const { mode } = useTheme()
  const bgClass = mode === 'dark' ? 'bg-dark' : 'bg-white'

  const { pathname } = useLocation()
  const { windowWidth } = useWindowInfo()
  const [collapsed, setCollapsed] = useState(windowWidth < 1000)
  const scrollableNodeRef = createRef() as React.RefObject<HTMLDivElement>

  useEffect(() => {
    const isCollapsed = windowWidth < 1000
    setCollapsed(isCollapsed)
  }, [windowWidth])
  useEffect(() => {
    scrollableNodeRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [pathname, scrollableNodeRef])

  return (
    <section className={cn('flex h-screen overflow-hidden')}>
      <Sidebar collapsed={collapsed} />
      <section className="relative flex h-screen flex-1 flex-col overflow-auto ">
        <Header
          className={cn(
            'min-h-[3rem] overflow-hidden transition-all duration-300',
          )}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
        />
        <main className="min-h-[calc(100vh-3rem)] bg-slate-200 ">
          <SimpleBar
            autoHide={false}
            style={{
              height: '100%',
              width: '100%',
            }}
            scrollableNodeProps={{ ref: scrollableNodeRef }}
          >
            <ModalProvider>
              <Outlet />
              <MyFloatButton />
            </ModalProvider>
          </SimpleBar>
        </main>
      </section>
    </section>
  )
}

export default Layout
