import ByFamilyList from './_components/ByFamilyList'
import CreateBelieverModel from './_components/CreateBelieverModel'
import TotalList from './_components/TotalList'
import Container from '@/components/container/Container'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import { useState } from 'react'

const BelieverListPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const items = [
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
      label: '家庭信眾資料',
      children: (
        <>
          <ByFamilyList />
        </>
      ),
      icon: <AndroidOutlined />,
    },
  ]

  const tabBarExtraContent = (
    <Button
      type="primary"
      onClick={() => {
        setCreateModalOpen(true)
      }}
    >
      新增信眾
    </Button>
  )

  return (
    <>
      <CreateBelieverModel
        createModalOpen={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
      />
      <Container className="m-3 rounded-md bg-white">
        <Tabs
          tabBarExtraContent={tabBarExtraContent}
          defaultActiveKey="2"
          type="card"
          items={items}
        />
      </Container>
    </>
  )
}

export default BelieverListPage
