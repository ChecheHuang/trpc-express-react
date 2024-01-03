import { cn } from '@/lib/utils'
import React, { forwardRef, HTMLAttributes } from 'react'
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const Wrap: React.ForwardRefRenderFunction<HTMLDivElement, ContainerProps> = (
  { children, className, ...rest },
  ref
) => {
  return (
    <>
      <div ref={ref} className={cn('p-4', className)} {...rest}>
        {children}
      </div>
    </>
  )
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(Wrap)

export default Container
