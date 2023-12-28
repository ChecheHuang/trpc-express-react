import ServiceModal from '@/components/modals/ServiceModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ServiceModal />
      {children}
    </>
  )
}

export default ModalProvider
