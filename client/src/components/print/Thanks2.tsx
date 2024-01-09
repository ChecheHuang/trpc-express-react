import { Card } from 'antd'
import { forwardRef, useMemo } from 'react'

import Loading from '@/components/Loading'
import { formatDate } from '@/lib/utils'
import { trpcQuery } from '@/provider/TrpcProvider'
import { useTemple } from '@/store/useTemple'

type Props = {
  printId?: string
}

const Thanks2 = forwardRef<HTMLDivElement, Props>(({ printId }, forwardRef) => {
  const {
    data = {
      orders: [],
      printAddress: '',
      totalPrice: 0,
      rank: 0,
      createdAt: new Date().toISOString(),
    },
    isFetching,
  } = trpcQuery.order.getPrintById.useQuery(printId as string, {
    enabled: !!printId,
  })

  const result = useMemo(() => {
    return data.orders.flatMap(({ serviceItems, ...rest }) =>
      serviceItems.map(({ name: serviceItem }) => ({
        ...rest,
        serviceItem,
        createdAt: data.createdAt,
      })),
    )
  }, [data.orders, data.createdAt])

  if (isFetching) return <Loading />
  return (
    <div ref={forwardRef}>
      {result.map((item, index) => {
        return (
          <>
            <Thanks2Item key={index} {...item} />
            {(index + 1) % 3 === 0 && (
              <div style={{ pageBreakAfter: 'always' }}></div>
            )}
          </>
        )
      })}
    </div>
  )
})

export default Thanks2

function Thanks2Item({
  serviceItem,
  believer,
  address,
  price,
  createdAt,
}: {
  serviceItem: string
  createdAt: string
  believer: string
  address: string
  year: number
  price: number
}) {
  const { temple } = useTemple()

  return (
    <Card className="font-[DFKai-sb] ">
      <div className="w-full flex text-3xl gap-x-[100px] font-black justify-center">
        <div>感</div>
        <div>謝</div>
        <div>狀</div>
      </div>
      <div className="flex justify-end pr-10">網路點燈專用</div>
      <div className="flex justify-between">
        <div className="text-lg">
          <div className="flex flex-col gap-2">
            <div>姓名: {believer}</div>
            <div>地址: {address}</div>
            <div>金額: {price}</div>
            <div>項目: {serviceItem}</div>
          </div>
          <div className="mt-2">
            <div className="text-3xl">{temple.name}</div>
            <div>電話: {temple.phone}</div>
            <div>地址: {temple.address}</div>
          </div>
        </div>
        <div className="vertical-rl">第一聯 存根聯</div>
      </div>
      <div className="flex justify-end pr-10 text-lg">
        {formatDate.toChinese(createdAt)}
      </div>
    </Card>
  )
}
