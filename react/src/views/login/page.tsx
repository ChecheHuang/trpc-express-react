import Form from './_components/Form'
import { cn } from '@/lib/utils'
import { trpcQuery } from '@/provider/TrpcProvider'
import { Image } from 'antd'

const Login = () => {
  trpcQuery.auth.onLogin.useSubscription(undefined, {
    onData: (message) => {
      console.log('websocket', message)
    },
  })

  return (
    <div
      className={cn(
        'flex h-screen w-screen items-center justify-center bg-cover bg-no-repeat',
        'bg-[url("/images/loginBg.jpeg")]',
      )}
    >
      <div className=" flex h-2/3 w-1/2 items-center justify-center rounded-lg  bg-black bg-opacity-30 shadow-md backdrop-blur-sm">
        <div className="text-center">
          <Image
            width="100px"
            preview={false}
            src="/images/loginImg.webp"
            alt=""
          />
          <h1 className="py-1 pb-2 text-3xl text-white">海光宮後台管理系統</h1>
          <Form />
        </div>
      </div>
    </div>
  )
}

export default Login
