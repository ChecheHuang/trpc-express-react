import { useBelieverModalStore } from './BelieverModal'
import Loading from '@/components/Loading'
import { useDebounce, useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'
import { Button, Checkbox, Form, Input, Modal, Spin, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FormInstance, Table } from 'antd/lib'
import { useMemo, useRef, useState } from 'react'
import { create } from 'zustand'

type SearchBeliverType = TrpcInputs['believer']['searchBeliever']

type DataType = GetArrType<TrpcOutputs['believer']['searchBeliever']>

type SearchBelieverType = 'createBeliever' | 'changeParent'

type SearchBelieverModalStoreType = {
  type: SearchBelieverType
  believer?: { id: string; name: string }
  setBeliever: (believer: { id: string; name: string }) => void
  isOpen: boolean
  onOpen: (type: SearchBelieverType) => void
  onClose: () => void
}

export const useSearchBelieverModalStore = create<SearchBelieverModalStoreType>(
  (set) => ({
    type: 'createBeliever',
    setBeliever: (believer) => set({ believer }),
    isOpen: false,
    onOpen: (type) => set({ isOpen: true, type }),
    onClose: () => set({ isOpen: false }),
  }),
)

function SearchBelieverModal() {
  const { isOpen, onClose, type, believer } = useSearchBelieverModalStore()

  const { onOpen: openCreateBelieverModal } = useBelieverModalStore()
  const { message } = useAntd()

  const utils = trpcQuery.useUtils()

  const map = new Map<
    SearchBelieverType,
    {
      title: string
      action: (believer: { id: string; name: string }) => void
      closeButtonText: string
      closeAction: () => void
    }
  >([
    [
      'createBeliever',
      {
        title: '選取現有信眾',
        action: (believer) => {
          openCreateBelieverModal(believer)
        },
        closeButtonText: '創建新戶',
        closeAction: () => openCreateBelieverModal(),
      },
    ],
    [
      'changeParent',
      {
        title: '更換戶長',
        action: async (currentBeliever) => {
          if (!believer) return
          await trpcClient.believer.changeBelieverParent.mutate({
            currentBelieverId: currentBeliever.id,
            id: believer?.id,
          })
          utils.believer.invalidate()
          message.success('更新成功')
        },
        closeButtonText: '自己為戶長',
        closeAction: async () => {
          if (!believer) return
          await trpcClient.believer.changeBelieverParent.mutate({
            id: believer?.id,
          })
          utils.believer.invalidate()
          message.success('更新成功')
        },
      },
    ],
  ])

  const currentService = map.get(type)

  const [inputData, setInputData] = useState<SearchBeliverType>({
    name: '',
    phone: '',
    address: '',
  })
  const [searchValue, setSearchValue] = useState<SearchBeliverType>({
    name: '',
    phone: '',
    address: '',
  })
  useDebounce(
    () => {
      setSearchValue(inputData)
    },
    500,
    [inputData],
  )
  const { data = [], isLoading } = trpcQuery.believer.searchBeliever.useQuery(
    searchValue,
    {
      keepPreviousData: true,
    },
  )
  const columns: ColumnsType<DataType> = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: '15%',
    },
    {
      title: '電話',
      dataIndex: 'phone',
      width: '10%',
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: '40%',
    },
    {
      width: '10%',
      title: '操作',
      dataIndex: 'action',
      render: (_, { id, name }) => (
        <Button
          type="primary"
          onClick={() => {
            currentService?.action({ id, name })
            onClose()
          }}
        >
          選擇
        </Button>
      ),
    },
  ]
  return (
    <>
      <Modal
        destroyOnClose
        title={currentService?.title || '搜尋信眾'}
        onCancel={onClose}
        open={isOpen}
        width={600}
        centered
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              currentService?.closeAction()
              onClose()
            }}
          >
            {currentService?.closeButtonText || '關閉'}
          </Button>,
        ]}
      >
        <div className="mb-1 flex gap-2">
          <Form.Item className="mb-0" label="姓名">
            <Input
              placeholder="請輸入姓名"
              onChange={(e) =>
                setInputData({ ...inputData, name: e.target.value })
              }
              value={inputData.name}
            />
          </Form.Item>
          <Form.Item className="mb-0" label="電話">
            <Input
              placeholder="請輸入電話"
              onChange={(e) =>
                setInputData({ ...inputData, phone: e.target.value })
              }
              value={inputData.phone}
            />
          </Form.Item>
          <Form.Item className="mb-0" label="地址">
            <Input
              placeholder="請輸入地址"
              onChange={(e) =>
                setInputData({ ...inputData, address: e.target.value })
              }
              value={inputData.address}
            />
          </Form.Item>
        </div>
        <Table
          className="min-h-[340px] cursor-pointer"
          loading={isLoading}
          size="small"
          dataSource={data.map((item) => ({ ...item, key: item.id }))}
          columns={columns}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 5,
          }}
        />
      </Modal>
    </>
  )
}

export default SearchBelieverModal
