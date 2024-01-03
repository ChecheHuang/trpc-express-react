import { cn } from '@/lib/utils'
import { useTheme } from '@/store/useTheme'
import { HTMLAttributes, useMemo } from 'react'

interface GroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  groupTitle?: string
  unstyled?: boolean
  size?: string
  notGlobalCol?: boolean
}

interface GroupItemProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
  className?: string
}

const Group: React.FC<GroupProps> & {
  Item: React.FC<GroupItemProps>
} = ({
  children,

  className,
  groupTitle,
  size,
  unstyled = false,
  notGlobalCol = false,
  ...rest
}) => {
  const { size: zustandSize } = useTheme()
  const groupSize = size ? size : zustandSize

  const formGridCol = useMemo(() => {
    if (groupSize === 'small') return 'grid-cols-4'
    if (groupSize === 'middle') return 'grid-cols-2'
    if (groupSize === 'large') return 'grid-cols-1'
  }, [groupSize])

  return (
    <>
      <div
        className={cn(
          !notGlobalCol && 'grid gap-x-3',
          !notGlobalCol && formGridCol,
          !unstyled && 'mb-10  rounded-lg p-2 shadow-lg  shadow-slate-500/40 ',
          className,
        )}
        {...rest}
      >
        {groupTitle && (
          <h1 className="col-span-full mb-3 text-center text-2xl font-bold text-gray-800">
            {groupTitle}
          </h1>
        )}

        {children}
      </div>
    </>
  )
}

export const GroupItem: React.FC<GroupItemProps> = ({
  children,
  title,
  className,
  ...rest
}) => {
  const { size } = useTheme()

  const formGridCol = useMemo(() => {
    if (size === 'small') return 'grid-cols-4'
    if (size === 'middle') return 'grid-cols-2'
    if (size === 'large') return 'grid-cols-1'
  }, [size])
  return (
    <div className={cn('col-span-full grid gap-x-3', formGridCol)} {...rest}>
      {title && (
        <h1
          className={cn('col-span-full mb-1  text-xl font-bold text-gray-800')}
        >
          {title}
        </h1>
      )}
      {children}
    </div>
  )
}
Group.Item = GroupItem

export default Group
