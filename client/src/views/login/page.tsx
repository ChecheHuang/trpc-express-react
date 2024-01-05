import { Image } from 'antd'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { trpcClient } from '@/provider/TrpcProvider'
import { useTemple } from '@/store/useTemple'

import Form from './_components/Form'

const Login = () => {
  const { temple } = useTemple()

  const text = 'Hello, World!' // 完整的文本内容
  const [visibleText, setVisibleText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const delay = 100 // 每个字符的延迟时间

  useEffect(() => {
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex === text.length) {
        clearInterval(interval)
        setShowCursor(false)
        return
      }

      setVisibleText((prevText) => prevText + text[currentIndex])
      currentIndex++
    }, delay)

    return () => {
      clearInterval(interval)
    }
  }, [])

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
        <div className="text-center">
          <Image
            width="100px"
            preview={false}
            src="/images/loginImg.webp"
            alt=""
          />
          <h1 className="py-1 pb-2 text-3xl text-white">
          
            {/* <div style={{ display: 'inline-flex' }}>
              {visibleText.split('').map((char, index) => {
                if (char === ' ') {
                  // 过滤掉空字符串元素
                  return null
                }
                return (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      marginRight:
                        index === visibleText.length - 1 ? '0.2rem' : 0,
                    }}
                  >
                    {char}
                  </motion.span>
                )
              })}
              {showCursor && (
                <motion.span
                  className="cursor"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5, yoyo: Infinity }}
                >
                  |
                </motion.span>
              )}
            </div> */}
            後台管理系統
          </h1>

          <Form />
        </div>
      </div>
    </div>
  )
}

export default Login
