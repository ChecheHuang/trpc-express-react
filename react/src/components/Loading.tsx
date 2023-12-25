import { Spin } from 'antd'

function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
      <Spin size="large" />
    </div>
  )
}

export default Loading
