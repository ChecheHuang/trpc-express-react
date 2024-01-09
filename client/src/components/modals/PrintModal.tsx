import { Modal } from 'antd'
import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { create } from 'zustand'

import Thanks1 from '@/components/print/Thanks1'
import Thanks2 from '@/components/print/Thanks2'

type PrintModalStoreType = {
  printId?: string
  isOpen: boolean
  onOpen: (printId: string) => void
  onClose: () => void
}

export const usePrintModalStore = create<PrintModalStoreType>((set) => ({
  isOpen: false,
  onOpen: (printId: string) => set({ isOpen: true, printId }),
  onClose: () => set({ isOpen: false }),
}))

const PrintModal = () => {
  const { isOpen, onClose, printId } = usePrintModalStore()

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  })

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '樣式1',
      children: <Thanks1 ref={printRef} printId={printId} />,
    },
    {
      key: '2',
      label: '樣式2',
      children: <Thanks2 ref={printRef} printId={printId} />,
    },
  ]

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
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  )
}

export default PrintModal
