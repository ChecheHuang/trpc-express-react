import { FloatButton } from 'antd'
import { motion } from 'framer-motion'

import { useWindowInfo } from '@/hooks/useHook'
import { CommentOutlined, AuditOutlined } from '@ant-design/icons'

import { useSearchBelieverModalStore } from '../modals/SearchBelieverModal'

const MyFloatButton = () => {
  const { windowWidth, windowHeight } = useWindowInfo()

  const { onOpen: openSearchBelieverModal } = useSearchBelieverModalStore()

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
          trigger="hover"
          type="primary"
          icon={<AuditOutlined />}
        >
          <FloatButton
            tooltip="信眾資料"
            onClick={() => openSearchBelieverModal('createBeliever')}
            shape="circle"
            icon={<CommentOutlined />}
          />
          <FloatButton shape="circle" icon={<CommentOutlined />} />
        </FloatButton.Group>
      </motion.div>
    </>
  )
}

export default MyFloatButton
