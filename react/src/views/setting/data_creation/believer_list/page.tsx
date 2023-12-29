import BelieverByFamilyList from './_components/BelieverByFamilyList'
import BelieverList from './_components/BelieverList'
import Container from '@/components/container/Container'
import { useSearchBelieverModalStore } from '@/components/modals/SearchBelieverModal'
import { useDebounce } from '@/hooks/useHook'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Table, Tabs } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState } from 'react'

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
