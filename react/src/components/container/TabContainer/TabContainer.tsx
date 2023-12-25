import useRefScroll from '@/components/container/TabContainer/useRefScroll'

import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { Switch } from 'antd'
import Container from '../Container'
interface TabContainerProps {
  mode?: 'horizontal' | 'vertical'
  className?: string
  tabsClassName?: string
  tabClassName?: string
  children: React.ReactNode
  isSwitch?: boolean
}

const TabContainer: React.FC<TabContainerProps> = ({
  className,
  tabClassName,
  tabsClassName,
  children,
  mode = 'horizontal',
  isSwitch,
}) => {
  const [myMode, setMyMode] = useState(mode)
  const containerRef = useRef(null)
  const scrollObj = useRefScroll(containerRef)
  const activeKey = scrollObj.activeKey
    ? scrollObj.activeKey
    : scrollObj.tabArray[0]?.key || ''
  const { handleClick, tabArray } = scrollObj

  return (
    <>
      <nav
        className={cn(
          'flex h-[2rem] items-center justify-center gap-1  bg-white ',
          'animate-in fade-in  ease-in-out',
          myMode === 'vertical' &&
            'absolute right-4 top-1/2  z-10 translate-y-[-50%] transform flex-col bg-transparent backdrop-blur-sm backdrop-filter',
          tabsClassName
        )}
      >
        {tabArray.map(({ key, label }) => {
          const activeClass = activeKey === key && 'after:block text-blue-600'

          return (
            <div
              className={cn(
                'relative   cursor-pointer text-center font-semibold  ',
                'after:absolute  after:top-6 after:hidden after:h-0.5 after:w-full  after:content-[""]  after:animate-in after:fade-in after:zoom-in after:duration-300 hover:after:block',
                myMode === 'vertical' && 'after:top-0 after:h-full after:w-0.5',
                'after:bg-blue-500 hover:text-blue-600 ',
                activeClass,
                tabClassName
              )}
              key={key}
              onClick={() => handleClick(key)}
            >
              {label}
            </div>
          )
        })}
        {!!isSwitch && (
          <Switch
            checkedChildren="horizontal"
            unCheckedChildren="vertical"
            defaultChecked
            onChange={() =>
              setMyMode(myMode === 'vertical' ? 'horizontal' : 'vertical')
            }
          />
        )}
      </nav>
      <Container
        ref={containerRef}
        className={cn(
          'h-[calc(100vh-6rem)] overflow-y-auto scroll-smooth  scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-dark ',
          className,
          myMode === 'vertical' && ' h-[calc(100vh-4rem)] pr-12'
        )}
      >
        {children}
      </Container>
    </>
  )
}

export default TabContainer
