import AntdProvider from '@/provider/AntdProvider'
import TrpcProvider from '@/provider/TrpcProvider'
import router from '@/router/router'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import BeforeChangeRoute from './components/BeforeChangeRoute'

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
            <Routes />
          </BeforeChangeRoute>
        </BrowserRouter>
      </AntdProvider>
      {/* <ReactQueryDevtools /> */}
    </TrpcProvider>
  )
}

export default App
