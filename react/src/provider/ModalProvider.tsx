import BelieverModal from '@/components/modals/BelieverModal'
import SearchBelieverModal from '@/components/modals/SearchBelieverModal'
import ServiceModal from '@/components/modals/ServiceModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ServiceModal />
      <SearchBelieverModal />
      <BelieverModal />
      {children}
    </>
  )
}

export default ModalProvider
