import { cn } from '@/lib/utils'
import { FallOutlined, RiseOutlined } from '@ant-design/icons'
import { Card } from 'antd'

interface ItemType {
  title: string
  number: number
  percent: string
  type: 'up' | 'down'
}

const Page = () => {
  const items: ItemType[] = [
    {
      title: '當年度',
      number: 43234234,
      percent: '43%',
      type: 'up',
    },
    {
      title: '當季度',
      number: 23423325,
      percent: '53%',
      type: 'up',
    },
    {
      title: '當月份',
      number: 432443,
      percent: '23%',
      type: 'down',
    },
    {
      title: '當周',
      number: 12423,
      percent: '53%',
      type: 'down',
    },
  ]
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="grid  grid-cols-4 gap-4">
        {items.map((item) => (
          <Item key={item.title} {...item} />
        ))}
      </div>
      <div className="flex gap-2">
        <Card className="w-1/2"></Card>
      </div>
    </div>
  )
}

export default Page
const Item = ({ title, number, percent, type }: ItemType) => {
  const Icon = type === 'up' ? RiseOutlined : FallOutlined

  return (
    <div className=" flex flex-col justify-around rounded-md bg-white p-4">
      <h2 className=" text-lg text-gray-500">{title}</h2>
      <div className="flex flex-wrap items-center">
        <div className="text-lg">{number.toLocaleString()}</div>
        <div
          className={cn(
            'ml-2 flex gap-2 rounded-md p-1 text-white',
            type === 'up' ? 'bg-blue-600' : 'bg-orange-400',
          )}
        >
          <Icon />
          {percent}
        </div>
      </div>
      <div className="text-sm text-gray-400">
        You made an extra
        <span
          className={cn(
            type === 'up' ? 'text-blue-600' : 'text-orange-400',
            'mx-1',
          )}
        >
          35,000
        </span>
        this year
      </div>
    </div>
  )
}
