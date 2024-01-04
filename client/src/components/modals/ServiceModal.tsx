import { Button, Checkbox, Form, Modal, Select } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Table } from 'antd/lib'
import { useState } from 'react'
import { create } from 'zustand'

import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { TrpcOutputs } from '@/types/trpc'

import { usePrintModalStore } from './PrintModal'

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

const currentYear = new Date().getFullYear() - 1911

function ServiceModal() {
  const [serviceYear, setServiceYear] = useState(currentYear)
  const { isOpen, onClose, info } = useServiceModalStore()

  const printModal = usePrintModalStore()

  const believer = info?.believer
  const serviceCategory = info?.serviceCategory

  const { message } = useAntd()
  const { name } = useUserStore()

  const utils = trpcQuery.useUtils()
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
                  if (item.isOrder) return <div>💡{item.name}</div>
                  return (
                    <Checkbox
                      disabled={serviceYear !== currentYear}
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
    const orders = await trpcClient.order.createOrder.mutate(submitData)
    refetch()
    utils.believer.getBelieverDetailsById.invalidate()
    form.resetFields()
    message.success('成功新增服務項目')
    printModal.setOrders(orders)
    printModal.onOpen()
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
        <Form form={form} className="grid grid-cols-2  gap-x-3">
          <Form.Item label="年度">
            <Select
              value={serviceYear}
              options={Array(3)
                .fill(currentYear)
                .map((value, index) => ({
                  value: value - index,
                  label: `${value - index}年度`,
                }))}
              onChange={(value) => setServiceYear(value)}
            />
          </Form.Item>
          <Form.Item label="總金額">
            <div className="flex ">{totalPrice}</div>
          </Form.Item>
          <div className="flex ">
            <Form.Item className="w-1/2" label="目前信眾">
              {believer?.name}
            </Form.Item>

            <Form.Item label="戶長">
              <div className="flex ">{parent.name}</div>
            </Form.Item>
          </div>

          <Form.Item label="經辦員">
            <div className="flex ">{name}</div>
          </Form.Item>
          <div className="col-span-full">
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
