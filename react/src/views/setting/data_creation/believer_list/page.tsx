import BelieverByFamilyList from './_components/BelieverByFamilyList'
import BelieverList from './_components/BelieverList'
import CreateBelieverModel from './_components/CreateBelieverModel'
import Container from '@/components/container/Container'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import { useState } from 'react'

const BelieverListPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(true)
  return (
    <>
      <CreateBelieverModel
        createModalOpen={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
      />
      <Container className="m-3 rounded-md bg-white">
        <Tabs
          tabBarExtraContent={
            <Button
              type="primary"
              onClick={() => {
                setCreateModalOpen(true)
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
