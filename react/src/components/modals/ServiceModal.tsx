import Loading from '@/components/Loading'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { TrpcOutputs } from '@/types/trpc'
import { Button, Checkbox, Form, Input, Modal } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FormInstance, Table } from 'antd/lib'
import { useRef } from 'react'
import { create } from 'zustand'

type ServiceModalStoreType = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useServiceModalStore = create<ServiceModalStoreType>((set) => ({
  isOpen: true,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))

type DataType = GetArrType<TrpcOutputs['service']['getServices']>

function ServiceModal() {
  const { isOpen, onClose } = useServiceModalStore()
  const { windowWidth } = useWindowInfo()
  const { modal } = useAntd()
  const { name } = useUserStore()
  const { data, isLoading } = trpcQuery.service.getServices.useQuery()
  console.log(data)

  const [form] = Form.useForm()

  const handleSubmit = async () => {
    const values = await form.validateFields()
    console.log(values)
  }

  if (isLoading) return <Loading />

  const col: ColumnsType<DataType> = [
    {
      title: '類別',
      rowScope: 'row',
      dataIndex: 'category',
    },
    {
      title: '項目',
      render: (_, { category, serviceItems }) => {
        return (
          <Form.Item name={category} className="mb-0">
            <Checkbox.Group
              options={serviceItems.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          </Form.Item>
        )
      },
    },
  ]

  return (
    <>
      <Modal
        title={'信眾服務'}
        onCancel={onClose}
        open={isOpen}
        width={900}
        centered
        footer={[
          <Button key="cancel" onClick={onClose}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleSubmit}>
            確定
          </Button>,
        ]}
      >
        <div className="p-4">
          <Form form={form} className="grid grid-cols-3  gap-x-3">
            <Form.Item
              initialValue={new Date().getFullYear() - 1911}
              name="year"
              label="年度"
            >
              <Input />
            </Form.Item>
            <Form.Item initialValue="0" name="totalPrice" label="總金額">
              <Input disabled />
            </Form.Item>
            <Form.Item name="user" initialValue={name} label="經辦員">
              <Input disabled />
            </Form.Item>

            <div className="col-span-3">
              <Table
                size="small"
                dataSource={data}
                columns={col}
                pagination={false}
              />
            </div>

            <Form.Item className=" col-span-3" label="備註" name={'note'}>
              <Input />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  )
}

export default ServiceModal
