import { Card } from 'antd'
import { forwardRef } from 'react'

import Loading from '@/components/Loading'
import { convertToChineseNumber, formatDate } from '@/lib/utils'
import { trpcQuery } from '@/provider/TrpcProvider'
import { useTemple } from '@/store/useTemple'
import { useUserStore } from '@/store/useUser'

type Props = {
  printId?: string
}

const Thanks1 = forwardRef<HTMLDivElement, Props>(({ printId }, forwardRef) => {
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

  const { temple } = useTemple()
  const { name } = useUserStore()

  if (isFetching) return <Loading />

  return (
    <div ref={forwardRef}>
      <Card className="font-[DFKai-sb] ">
        <div className="relative flex justify-between">
          <div>H0000009</div>
          <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-3xl font-black tracking-[20px] ">
            感謝狀
          </div>
          <div>
            <div className=" text-right">
              {formatDate.toChinese(data.createdAt)}
            </div>
            <div className="text-right">經辦員：{name}</div>
          </div>
        </div>
        <div className="text-lg">{data?.printAddress}</div>
        <div className="text-right text-lg font-bold">
          新台幣{convertToChineseNumber(data.totalPrice)}元整
        </div>
        <div className="text-center text-lg font-bold">
          {temple.wordsOfThanksForService}
        </div>
        <table className="mb-4 w-full table-fixed text-center text-sm">
          <thead>
            <tr>
              <th>信眾</th>
              <th>項目</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody className="">
            {data?.orders.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.believer}</td>
                <td>
                  {item.serviceItems
                    .map((item) => item.service + '-' + item.name)
                    .join(',')}
                </td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex  justify-between">
          <div>
            <p className="text-lg">{temple.name}</p>
            <p className="text-sm">電話 {temple.phone}</p>
            <p className="text-sm">{temple.address}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">總計</p>
            <p className="text-xl font-bold">{data?.totalPrice}</p>
            {/* <p className="">王主委</p> */}
          </div>
        </div>
      </Card>
      <div style={{ pageBreakAfter: 'always' }}></div>
    </div>
  )
})

export default Thanks1
