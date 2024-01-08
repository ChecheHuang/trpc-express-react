import { Modal } from 'antd'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { create } from 'zustand'

import { ThankPrint } from '@/views/setting/template/thank/page'

type PrintModalStoreType = {
  printId?: string
  setPrintId: (printId: string) => void
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const usePrintModalStore = create<PrintModalStoreType>((set) => ({
  setPrintId: (printId) => set({ printId }),
  isOpen: true,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))

const PrintModal = () => {
  const { isOpen, onOpen, onClose, printId } = usePrintModalStore()

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

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
      <ThankPrint ref={printRef} printId={printId} />
    </Modal>
  )
}

export default PrintModal
