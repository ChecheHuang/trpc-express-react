import { debounce } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

export type TabType = {
  label: string
  key: string
  rect: Offset
}

type Offset = {
  top: number
  bottom: number
}

function useRefScroll<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [tabArray, setTabArray] = useState<TabType[]>([])

  useEffect(() => {
    if (!ref.current) return
    const main = ref.current
    const divElementsWithId: NodeListOf<HTMLDivElement> =
      main.querySelectorAll('div[aria-label]')

    const tabs: TabType[] = Array.from(divElementsWithId).reduce((acc, cur) => {
      const label = cur.getAttribute('aria-label')
      const rect = cur.getBoundingClientRect()
      const labelHeight = 100
      if (label)
        acc.push({
          label,
          key: cur.id,
          rect: {
            top: rect.top - labelHeight,
            bottom: rect.bottom - labelHeight,
          },
        })
      return acc
    }, [] as TabType[])

    setTabArray(tabs)
  }, [ref])
  const handleClick = (id: string) => {
    const section = ref.current?.querySelector(`#${id}`)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
      setActiveKey(id)
    }
  }

  const handleScroll = useCallback(() => {
    if (!ref.current) return
    const scrollPosition = ref.current.scrollTop

    for (let i = 0; i < tabArray.length; i++) {
      const { key, rect } = tabArray[i]
      if (scrollPosition >= rect.top && scrollPosition < rect.bottom) {
        setActiveKey(key)
        break
      }
    }
  }, [tabArray, ref])
  const debounceScroll = debounce(handleScroll, 50)
  useEffect(() => {
    if (!ref.current) return
    const main = ref.current

    main.addEventListener('scroll', debounceScroll)

    return () => {
      main.removeEventListener('scroll', debounceScroll)
    }
  }, [ref, debounceScroll])

  return { activeKey, handleClick, tabArray }
}

export default useRefScroll
