import Loading from '@/components/Loading'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { useUserStore } from '@/store/useUser'
import { TrpcOutputs } from '@/types/trpc'
import { Button, Checkbox, Form, Input, Modal } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FormInstance, Table } from 'antd/lib'
import { useMemo, useRef } from 'react'
import { create } from 'zustand'

type ServiceModalStoreType = {
  believers: { name: string; id: string }[]
  isOpen: boolean
  onOpen: (believerId: { name: string; id: string }) => void
  onClose: () => void
}

export const useServiceModalStore = create<ServiceModalStoreType>((set) => ({
  believers: [],
  isOpen: true,
  onOpen: (believer) => set({ isOpen: true, believers: [believer] }),
  onClose: () => set({ isOpen: false }),
}))

type DataType = GetArrType<TrpcOutputs['service']['getServices']>

function ServiceModal() {
  const { isOpen, onClose, believers } = useServiceModalStore()
  const { windowWidth } = useWindowInfo()
  const { modal } = useAntd()
  const { name } = useUserStore()
  const { data, isLoading } = trpcQuery.service.getServices.useQuery()
  const [form] = Form.useForm()

  const flattenServiceItemMap = useMemo(() => {
    const map = new Map()
    if (data) {
      data.forEach((item) => {
        item.serviceItems.forEach(({id,price}) => {
          map.set(id, price)
        })
      })
    }
    return map
  }, [data])

  const totalPrice = Form.useWatch(
    (values) => {
      const { user, year, note, ...rest } = values
      let total = 0
      for (const arrayKey in rest) {
        const array = rest[arrayKey]
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

  return (
    <>
      <Modal
        title={believers[0]?.name || '信眾服務'}
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
