import Container from '@/components/container/Container'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import { useState } from 'react'
import ByFamilyList from './_components/ByFamilyList'
import CreateBelieverModel from './_components/CreateBelieverModel'
import TotalList from './_components/TotalList'

const BelieverListPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
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
                  <TotalList />
                </>
              ),
              icon: <AppleOutlined />,
            },
            {
              key: 'transform',
              label: '戶口信眾資料',
              children: (
                <>
                  <ByFamilyList />
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
