import React from 'react'
import { Card as AntdCard } from 'antd'
import { CardProps } from 'antd/lib/card'
import { cn } from '@/lib/utils'

type MyCardProps = CardProps & {
  // Add any additional custom props here
}

const MyCard: React.FC<MyCardProps> = ({ children, ...rest }) => {
  return (
    <AntdCard {...rest}>
      <div
        className={cn('flex flex-col gap-3 animate-in fade-in duration-500')}
      >
        {children}
      </div>
    </AntdCard>
  )
}

export default MyCard
