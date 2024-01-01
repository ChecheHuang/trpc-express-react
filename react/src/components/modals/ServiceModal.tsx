import Loading from '@/components/Loading'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { TrpcOutputs } from '@/types/trpc'
import { Button, Checkbox, Form, Input, Modal, Spin, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FormInstance, Table } from 'antd/lib'
import { useMemo, useRef, useState } from 'react'
import { create } from 'zustand'

type ServiceModalStoreType = {
  believer?: { id: string; name: string }
  isOpen: boolean
  onOpen: (believer: { id: string; name: string }) => void
  onClose: () => void
}

export const useServiceModalStore = create<ServiceModalStoreType>((set) => ({
  believer: undefined,
  isOpen: false,
  onOpen: (believer) => set({ isOpen: true, believer }),
  onClose: () => set({ isOpen: false }),
}))

type DataType = GetArrType<TrpcOutputs['service']['getServices']>

function ServiceModal() {
  const { isOpen, onClose, believer } = useServiceModalStore()
  const { data: result, isFetching } =
    trpcQuery.believer.getBelieverById.useQuery(believer?.id as string, {
      refetchOnWindowFocus: false,
      enabled: !!believer?.id,
    })
  const data = result?.data || []

  const items: TabsProps['items'] =
    data.map(({ name, id }, index) => {
      return {
        key: index.toString(),
        label: name,
        children: <ServiceForm id={id} />,
      }
    }) || []

  return (
    <>
      <Modal
        title={'信眾服務'}
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
  id: string
}

function ServiceForm({ id }: ServiceFormProps) {
  const [serviceYear, setServiceYear] = useState(
    new Date().getFullYear() - 1911,
  )
  const { message, modal } = useAntd()
  const { name } = useUserStore()

  const { data, isLoading } = trpcQuery.service.getServices.useQuery({
    year: serviceYear,
  })
  const { mutate: createOrder } = trpcQuery.order.createOrder.useMutation({
    onSuccess: () => {
      modal.success({ title: '訂單建立成功' })
      // onClose()
    },
  })

  const [form] = Form.useForm()
  const flattenServiceItemMap = useMemo(() => {
    const map = new Map()
    if (data) {
      data.forEach((item) => {
        item.serviceItems.forEach(({ id, price }) => {
          map.set(id, price)
        })
      })
    }
    return map
  }, [data])

  const totalPrice = Form.useWatch(
    (values) => {
      let total = 0
      for (const arrayKey in values) {
        const array = values[arrayKey]
        for (const id of array) {
          const price = flattenServiceItemMap.get(id)
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
      const array = values[arrayKey]
      serviceItemIds = [...serviceItemIds, ...array]
    }
    createOrder({
      believerId: id,
      serviceItemIds,
    })
  }

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
          <Form.Item initialValue={[]} name={category} className="mb-0">
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
          <Input
            value={serviceYear}
            onChange={(e) => setServiceYear(Number(e.target.value))}
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
            dataSource={data}
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
