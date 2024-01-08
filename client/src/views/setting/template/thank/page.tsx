import { Button, Card } from 'antd'
import { forwardRef, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

import Container from '@/components/container/Container'
import { convertToChineseNumber } from '@/lib/utils'
import { useTemple } from '@/store/useTemple'
import { useUserStore } from '@/store/useUser'
import { TrpcOutputs } from '@/types/trpc'

const ThankPage = () => {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  return (
    <Container>
      <Button onClick={handlePrint} type="primary">
        列印
      </Button>
      <ThankPrint ref={printRef} />
    </Container>
  )
}

export default ThankPage

type Props = {
  orders?: TrpcOutputs['order']['createOrder']
}

export const ThankPrint = forwardRef<HTMLDivElement, Props>(
  (props, forwardRef) => {
    const { temple } = useTemple()
    const orders = props.orders || [
      { category: '點燈', name: '平安', count: 3, price: 1500 },
    ]

    const totalPrice = orders.reduce((acc, { price }) => acc + price, 0)
    const { name } = useUserStore()

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
                {((): string => {
                  const today = new Date()
                  const year = today.getFullYear() - 1911
                  const month = today.getMonth() + 1
                  const day = today.getDate()
                  return `中華民國 ${year}年${month}月${day}日`
                })()}
              </div>
              <div className="text-right">經辦員：{name}</div>
            </div>
          </div>
          {/* <div className="text-lg">台北市士林區葫蘆街87號</div> */}
          <div className="text-right text-lg font-bold">
            新台幣{convertToChineseNumber(totalPrice)}元整
          </div>
          <div className="text-center text-lg font-bold">
            {temple.wordsOfThanksForService}
          </div>
          <table className="mb-4 w-full table-fixed text-center text-sm">
            <thead>
              <tr>
                <th>名稱</th>
                <th>項目</th>
                <th>數量</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody className="">
              {orders.map(({ category, name, count, price }) => (
                <tr key={name} className="border-b">
                  <td className="py-2">{category}</td>
                  <td>{name}</td>
                  <td>{count}</td>
                  <td>{price}</td>
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
              <p className="text-xl font-bold">{totalPrice}</p>
              {/* <p className="">王主委</p> */}
            </div>
          </div>
        </Card>
        <div style={{ pageBreakAfter: 'always' }}></div>
      </div>
    )
  },
)
