import BelieverModal from '@/components/modals/BelieverModal'
import PrintModal from '@/components/modals/PrintModal'
import SearchBelieverModal from '@/components/modals/SearchBelieverModal'
import ServiceModal from '@/components/modals/ServiceModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ServiceModal />
      <SearchBelieverModal />
      <BelieverModal />
      <PrintModal />
      {children}
    </>
  )
}

export default ModalProvider
