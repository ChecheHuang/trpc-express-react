import { useWindowInfo } from '@/hooks/useHook'
import { CommentOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import { FloatButton } from 'antd'
import { motion } from 'framer-motion'

const MyFloatButton = () => {
  const { windowWidth, windowHeight } = useWindowInfo()
  return (
    <>
      <motion.div
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100000 }}
        drag
        dragConstraints={{
          bottom: 30,
          right: 30,
          top: -(windowHeight - 140),
          left: -(windowWidth - 340),
        }}
      >
        <FloatButton.Group
          shape="circle"
          trigger="click"
          type="primary"
          icon={<CustomerServiceOutlined />}
        >
          <FloatButton shape="circle" icon={<CommentOutlined />} />
          <FloatButton shape="circle" icon={<CommentOutlined />} />
        </FloatButton.Group>
      </motion.div>
    </>
  )
}

export default MyFloatButton
