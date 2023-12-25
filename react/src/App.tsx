import BeforeChangeRoute from './components/BeforeChangeRoute'
import AntdProvider from '@/provider/AntdProvider'
import ModalProvider from '@/provider/ModalProvider'
import TrpcProvider from '@/provider/TrpcProvider'
import router from '@/router/router'
import { useRoutes, BrowserRouter } from 'react-router-dom'

const Routes = () => {
  const routes = useRoutes(router)
  return routes
}

function App() {
  return (
    <TrpcProvider>
      <AntdProvider>
        <BrowserRouter>
          <BeforeChangeRoute>
            <ModalProvider>
              <Routes />
            </ModalProvider>
          </BeforeChangeRoute>
        </BrowserRouter>
      </AntdProvider>
      {/* <ReactQueryDevtools /> */}
    </TrpcProvider>
  )
}

export default App
