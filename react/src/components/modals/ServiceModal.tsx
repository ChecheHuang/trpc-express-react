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
  believer?: { id: string; name: string }
  serviceCategory?: { id: string; category: string }
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
  onOpen: ({ believer, serviceCategory }) =>
    set({ isOpen: true, believer, serviceCategory }),
  onClose: () => set({ isOpen: false }),
}))

type DataType = GetArrType<TrpcOutputs['service']['getServices']>

function ServiceModal() {
  const { isOpen, onClose, believer, serviceCategory } = useServiceModalStore()
  const { data: result, isFetching } =
    trpcQuery.believer.getBelieverById.useQuery(believer?.id as string, {
      refetchOnWindowFocus: false,
      enabled: !!believer?.id,
    })
  const data = result?.data || []

  console.log(believer)
  console.log(serviceCategory)

  const items: TabsProps['items'] =
    data.map(({ name, id }, index) => {
      return {
        key: index.toString(),
        label: name,
        children: <ServiceForm believerId={id} />,
      }
    }) || []

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
        {isFetching ? (
          <div className="flex h-[400px] w-full items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <Tabs defaultActiveKey="0" items={items} />
        )}
      </Modal>
    </>
  )
}

export default ServiceModal

type ServiceFormProps = {
  believerId: string
}

function ServiceForm({ believerId }: ServiceFormProps) {
  const [serviceYear, setServiceYear] = useState(
    new Date().getFullYear() - 1911,
  )
  const { message, modal } = useAntd()
  const { name } = useUserStore()

  const { data, isLoading } = trpcQuery.service.getServices.useQuery({
    year: serviceYear,
    believerId,
  })

  const [form] = Form.useForm()

  const totalPrice = Form.useWatch(
    (values) => {
      let total = 0
      for (const arrayKey in values) {
        const array = values[arrayKey]
        for (const { price } of array) {
          total += price || 0
        }
      }
      return total
    },
    { form },
  )
  const handleSubmit = async () => {
    const values = await form.validateFields()
    let serviceItemIds: string[] = []
    for (const arrayKey in values) {
      const array = values[arrayKey].map((item: { id: string }) => item.id)
      serviceItemIds = [...serviceItemIds, ...array]
    }
    await trpcClient.order.createOrder.mutate({
      believerId,
      serviceItemIds,
    })
  }

  const col: ColumnsType<DataType> = [
    {
      title: '類別',
      rowScope: 'row',
      dataIndex: 'category',
      width: '50px',
    },
    {
      title: '項目',
      render: (_, { category, serviceItems }) => {
        return (
          <Form.Item initialValue={[]} name={category} className="mb-0">
            <Checkbox.Group>
              {serviceItems.map((item) => (
                <Checkbox value={item} key={item.id}>
                  {item.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        )
      },
    },
  ]
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }
  return (
    <div className="h-[400px] w-full p-4 ">
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
        <Form.Item label="經辦員">
          <Input value={name} disabled />
        </Form.Item>
        <div className="col-span-3">
          <Table
            size="small"
            dataSource={data?.map((item) => ({ ...item, key: item.id }))}
            columns={col}
            pagination={false}
          />
        </div>
        <Form.Item className="col-span-full mb-0 mt-2 flex justify-center">
          <Button type="primary" onClick={handleSubmit}>
            送出
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
