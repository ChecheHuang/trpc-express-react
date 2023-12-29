import CreateBelieverModal from '@/components/modals/CreateBelieverModal'
import SearchBelieverModal from '@/components/modals/SearchBelieverModal'
import ServiceModal from '@/components/modals/ServiceModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ServiceModal />
      <SearchBelieverModal />
      <CreateBelieverModal />
      {children}
    </>
  )
}

export default ModalProvider
