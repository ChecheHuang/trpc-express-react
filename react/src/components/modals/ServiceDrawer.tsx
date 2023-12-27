import { Drawer } from 'antd'

import { create } from 'zustand'
import ExtendedButton from '../buttons/ExtendedButton'
import { useServiceModalStore } from './ServiceModal'
type ServiceDrawerStoreType = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useServiceDrawerStore = create<ServiceDrawerStoreType>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))

function ServiceDrawer() {
  const { isOpen, onClose } = useServiceDrawerStore()

  const { onOpen: setIsServiceModalOpen } = useServiceModalStore()

  return (
    <>
      <Drawer
        title="宮廟服務"
        placement="right"
        onClose={onClose}
        open={isOpen}
      >
        <div className="grid w-full gap-2">
          {['信眾服務', '拜斗服務'].map((item) => {
            return (
              <ExtendedButton
                onClick={() => {
                  onClose()
                  setIsServiceModalOpen()
                }}
                type="primary"
                key={item}
              >
                {item}
              </ExtendedButton>
            )
          })}
        </div>
      </Drawer>
    </>
  )
}

export default ServiceDrawer
