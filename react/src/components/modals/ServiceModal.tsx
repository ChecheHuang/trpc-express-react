import Loading from '@/components/Loading'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { TrpcOutputs } from '@/types/trpc'
import { Button, Checkbox, Form, Input, Modal, Select, Spin, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FormInstance, Table } from 'antd/lib'
import { useMemo, useRef, useState } from 'react'
import { create } from 'zustand'

type ServiceModalStoreType = {
  info?: {
    believer: { id: string; name: string }
    serviceCategory: { id: string; category: string }
  }
  isOpen: boolean
  onOpen: (info: {
    believer: { id: string; name: string }
    serviceCategory: { id: string; category: string }
  }) => void
  onClose: () => void
}

export const useServiceModalStore = create<ServiceModalStoreType>((set) => ({
  believer: undefined,
  isOpen: false,
  onOpen: (info) => set({ isOpen: true, info }),
  onClose: () => set({ isOpen: false }),
}))

type DataType = GetArrType<TrpcOutputs['service']['getServices']['list']>

function ServiceModal() {
  const [serviceYear, setServiceYear] = useState(
    new Date().getFullYear() - 1911,
  )
  const { isOpen, onClose, info } = useServiceModalStore()
  const believer = info?.believer
  const serviceCategory = info?.serviceCategory
  const { message, modal } = useAntd()
  const { name } = useUserStore()
  const [form] = Form.useForm<
    Record<
      string,
      {
        id: string
        name: string
        price: number
      }[]
    >
  >()
  const totalPrice = Form.useWatch(
    (values) =>
      Object.values(values).reduce((acc, array) => {
        return acc + array.reduce((sum, { price }) => sum + (price || 0), 0)
      }, 0),
    { form },
  )

  const { data, isLoading, refetch } = trpcQuery.service.getServices.useQuery(
    {
      year: serviceYear,
      believerId: believer?.id as string,
      serviceId: serviceCategory?.id as string,
    },
    {
      enabled: !!info,
    },
  )

  const list = data?.list || []
  const parent = data?.parent || { name: '', familyId: 0 }

  const columns: ColumnsType<DataType> = [
    {
      title: '姓名',
      rowScope: 'row',
      dataIndex: 'name',
      width: '100px',
    },
    {
      title: ` ${serviceYear}年度${serviceCategory?.category}服務項目`,
      render: (_, { name, serviceItems, id }) => {
        return (
          <>
            <Form.Item initialValue={[]} name={id} className="mb-0">
              <Checkbox.Group>
                {serviceItems.map((item) => {
                  return (
                    <Checkbox
                      disabled={item.isOrder}
                      value={item}
                      key={item.id}
                    >
                      {item.name}
                    </Checkbox>
                  )
                })}
              </Checkbox.Group>
            </Form.Item>
          </>
        )
      },
    },
  ]

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const submitData = Object.entries(values).map(
      ([believerId, serviceItems]) => ({
        believerId,
        serviceItemIds: serviceItems.map((item: { id: string }) => item.id),
      }),
    )
    const totalPrice = await trpcClient.order.createOrder.mutate(submitData)
    refetch()
    modal.confirm({
      title: '是否列印',
      content: `總金額為 ${totalPrice} 元`,
      onOk: () => {
        form.resetFields()
      },
    })
  }

  return (
    <>
      <Modal
        destroyOnClose
        title={serviceCategory?.category || '服務'}
        onCancel={onClose}
        open={isOpen}
        width={900}
        centered
        footer={[
          <Button key="ok" type="primary" onClick={onClose}>
            關閉
          </Button>,
        ]}
      >
        <Form form={form} className="grid grid-cols-3  gap-x-3">
          <Form.Item label="年度">
            <Select
              value={serviceYear}
              options={[
                { label: '112', value: 112 },
                { label: '113', value: 113 },
              ]}
              onChange={(value) => setServiceYear(value)}
            />
          </Form.Item>
          <Form.Item label="總金額">
            <Input value={totalPrice} disabled />
          </Form.Item>
          <Form.Item label="戶長">
            <Input value={parent.name} disabled />
          </Form.Item>
          <Form.Item label="經辦員">
            <Input value={name} disabled />
          </Form.Item>
          <div className="col-span-3">
            <Table
              loading={isLoading}
              size="small"
              columns={columns}
              dataSource={list.map((item) => ({ ...item, key: item.id }))}
              pagination={false}
            />
          </div>
          <Form.Item className="col-span-full mb-0 mt-2 flex justify-center">
            <Button onClick={handleSubmit} type="primary">
              送出
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ServiceModal
