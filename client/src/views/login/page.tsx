import { Image } from 'antd'
import { useEffect } from 'react'

import Text from '@/components/Text'
import { cn } from '@/lib/utils'
import { trpcClient } from '@/provider/TrpcProvider'
import { useTemple } from '@/store/useTemple'

import Form from './_components/LoginForm'

const Login = () => {
  const {
    temple: { name },
  } = useTemple()

  useEffect(() => {
    const connection = trpcClient.auth.onLogin.subscribe(undefined, {
      onData: (message) => {
        console.log('websocket', message)
      },
    })
    return () => {
      connection.unsubscribe()
    }
  }, [])

  return (
    <div
      className={cn(
        'flex h-screen w-screen items-center justify-center bg-cover bg-no-repeat',
        'bg-[url("/images/loginBg.jpeg")]',
      )}
    >
      <div className=" flex h-2/3 w-1/2 items-center justify-center rounded-lg  bg-black bg-opacity-30 shadow-md backdrop-blur-sm">
        <div className="text-center w-[300px]">
          <Image
            width="100px"
            preview={false}
            src="/images/loginImg.webp"
            alt=""
          />
          <h1 className="py-1 pb-2 text-3xl text-white">
            <Text text={name + '後台管理系統'} delay={150} />
          </h1>
          <Form />
        </div>
      </div>
    </div>
  )
}

export default Login
