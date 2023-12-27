import ServiceDrawerModal from '@/components/modals/ServiceDrawer'
import ServiceModal from '@/components/modals/ServiceModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ServiceDrawerModal />
      <ServiceModal />
      {children}
    </>
  )
}

export default ModalProvider
