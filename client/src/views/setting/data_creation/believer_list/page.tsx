import Container from '@/components/container/Container'
import { useSearchBelieverModalStore } from '@/components/modals/SearchBelieverModal'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import BelieverByFamilyList from './_components/BelieverByFamilyList'
import BelieverList from './_components/BelieverList'

const BelieverListPage = () => {
  const { onOpen } = useSearchBelieverModalStore()

  return (
    <>
      <Container className="m-3 rounded-md bg-white">
        <Tabs
          tabBarExtraContent={
            <Button
              type="primary"
              onClick={() => {
                onOpen('createBeliever')
              }}
            >
              新增信眾
            </Button>
          }
          defaultActiveKey="2"
          type="card"
          items={[
            {
              key: 'total',
              label: '信眾資料',
              children: (
                <>
                  <BelieverList />
                </>
              ),
              icon: <AppleOutlined />,
            },
            {
              key: 'transform',
              label: '戶口信眾資料',
              children: (
                <>
                  <BelieverByFamilyList />
                </>
              ),
              icon: <AndroidOutlined />,
            },
          ]}
        />
      </Container>
    </>
  )
}

export default BelieverListPage
