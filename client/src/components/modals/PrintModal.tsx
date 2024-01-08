import { Modal } from 'antd'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { create } from 'zustand'

import { TrpcOutputs } from '@/types/trpc'
import { ThankPrint } from '@/views/setting/template/thank/page'

type PrintModalStoreType = {
  orders: TrpcOutputs['order']['createOrder']
  setOrders: (orders: TrpcOutputs['order']['createOrder']) => void
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const usePrintModalStore = create<PrintModalStoreType>((set) => ({
  isOpen: false,
  orders: [] as TrpcOutputs['order']['createOrder'],
  setOrders: (orders) => set({ orders }),
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))

const PrintModal = () => {
  const { isOpen, onOpen, onClose, orders } = usePrintModalStore()

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })
  // console.log(orders)

  return (
    <Modal
      destroyOnClose
      title={'列印感謝狀'}
      onCancel={onClose}
      onOk={handlePrint}
      okText="列印"
      open={isOpen}
      width={900}
      centered
    >
      <ThankPrint ref={printRef} orders={orders} />
    </Modal>
  )
}

export default PrintModal
