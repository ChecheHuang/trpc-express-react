import Container from '@/components/container/Container'
import { Button, Card } from 'antd'
import { Fragment, forwardRef, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const DomPage = () => {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  return (
    <Container>
      <Button onClick={handlePrint} type="primary">
        列印
      </Button>
      {/* <ComponentToPrint ref={printRef} /> */}
      <Card ref={printRef} className="font-[DFKai-sb] ">
        <div className="relative flex justify-between">
          <div>H0000009</div>
          <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-3xl font-black tracking-[20px] ">
            感謝狀
          </div>
          <div>
            <div className=" text-right">中華民國 97年10月08日</div>
            <div className="text-right">經辦員：王曉明</div>
          </div>
        </div>
        <div className="text-lg">台北市中山路12號</div>
        <div className="text-right text-lg font-bold">
          新台幣貳仟陸佰壹拾元整
        </div>
        <div className="text-center text-lg font-bold">
          虔誠之心神神感激特以此狀以表謝意
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
            <tr className="border-b">
              <td className="py-2">a123</td>
              <td>選項A</td>
              <td>1</td>
              <td>2,110</td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">電話 02-123456</p>
            <p className="text-sm">總金額大寫貳仟陸佰壹拾元整</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">總計</p>
            <p className="text-xl font-bold">2,610</p>
            <p className="">王主委</p>
          </div>
        </div>
      </Card>
    </Container>
  )
}

export default DomPage

const ComponentToPrint = forwardRef<HTMLDivElement>((_, forwardRef) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current) {
      const { clientHeight, scrollHeight } = ref.current
      if (scrollHeight > clientHeight) {
        const pageBreak = document.createElement('div')
        pageBreak.style.pageBreakAfter = 'always'
        ref.current.appendChild(pageBreak)
      }
    }
  }, [])

  return (
    <div
      ref={(node) => {
        ref.current = node
        if (typeof forwardRef === 'function') {
          forwardRef(node)
        } else if (forwardRef) {
          forwardRef.current = node
        }
      }}
    >
      <Card className="font-[DFKai-sb] ">
        <div className="relative flex justify-between">
          <div>H0000009</div>
          <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-3xl font-black tracking-[20px] ">
            感謝狀
          </div>
          <div>
            <div className=" text-right">中華民國 97年10月08日</div>
            <div className="text-right">經辦員：王曉明</div>
          </div>
        </div>
        <div className="text-lg">台北市中山路12號</div>
        <div className="text-right text-lg font-bold">
          新台幣貳仟陸佰壹拾元整
        </div>
        <div className="text-center text-lg font-bold">
          虔誠之心神神感激特以此狀以表謝意
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
            <tr className="border-b">
              <td className="py-2">a123</td>
              <td>選項A</td>
              <td>1</td>
              <td>2,110</td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">電話 02-123456</p>
            <p className="text-sm">總金額大寫貳仟陸佰壹拾元整</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">總計</p>
            <p className="text-xl font-bold">2,610</p>
            <p className="">王主委</p>
          </div>
        </div>
      </Card>
      <div style={{ pageBreakAfter: 'always' }}></div>
    </div>
  )
})
