import { useTheme } from '@/store/useTheme'
import { HappyProvider } from '@ant-design/happy-work-theme'
import { Modal, message } from 'antd'
import { ConfigProvider } from 'antd'
import zhTW from 'antd/es/locale/zh_TW'
import type { MessageInstance } from 'antd/es/message/interface'
import { ModalStaticFunctions } from 'antd/es/modal/confirm'
import React, { createContext, useContext } from 'react'

const AntdContext = createContext<{
  message: MessageInstance
  modal: Omit<ModalStaticFunctions, 'warn'>
} | null>(null)

export function useAntd() {
  const messageContext = useContext(AntdContext)
  if (!messageContext) {
    throw new Error('useAntd must be used within a AntdProvider')
  }
  return messageContext
}

function AntdProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [messageApi, messageContextHolder] = message.useMessage()
  const [modal, modelContextHolder] = Modal.useModal()
  const { colorPrimary } = useTheme()
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        token: {
          colorPrimary,
        },
      }}
    >
      <HappyProvider>
        <AntdContext.Provider value={{ message: messageApi, modal }}>
          {children}
          {messageContextHolder}
          {modelContextHolder}
        </AntdContext.Provider>
      </HappyProvider>
    </ConfigProvider>
  )
}
export default AntdProvider
