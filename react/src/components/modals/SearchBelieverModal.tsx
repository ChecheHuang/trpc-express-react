import { useCreateBelieverModalStore } from './CreateBelieverModal'
import Loading from '@/components/Loading'
import { useDebounce, useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
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
type SearchBelieverModalStoreType = {
  type?: string
  isOpen: boolean
  onOpen: (type?: string) => void
  onClose: () => void
}

export const useSearchBelieverModalStore = create<SearchBelieverModalStoreType>(
  (set) => ({
    type: 'createBeliever',
    isOpen: true,
    onOpen: (type) => set({ isOpen: true, type }),
    onClose: () => set({ isOpen: false }),
  }),
)

function SearchBelieverModal() {
  const { isOpen, onClose, type } = useSearchBelieverModalStore()

  const { onOpen: openCreateBelieverModal } = useCreateBelieverModalStore()

  console.log(type)
  const map = {
    createBeliever: {
      title: '選取戶長',
      closeButtonText: '創建新戶',
      action: openCreateBelieverModal,
    },
  }

  const currentService = map[type as keyof typeof map]

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
  const { data, isLoading } = trpcQuery.believer.searchBeliever.useQuery(
    searchValue,
    {
      keepPreviousData: true,
    },
  )
  const columns: ColumnsType<DataType> = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: '10%',
    },
    {
      title: '電話',
      dataIndex: 'phone',
      width: '10%',
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: '20%',
    },
    {
      width: '10%',
      title: '操作',
      dataIndex: 'action',
      render: (_, { id }) => (
        <Button
          type="primary"
          onClick={() => {
            console.log(id)
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
          <Button key="ok" type="primary" onClick={onClose}>
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
          dataSource={data}
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
