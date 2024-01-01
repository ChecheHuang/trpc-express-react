import DropdownButton from '../buttons/DropdownButton'
import ExtendedButton from '../buttons/ExtendedButton'
import AddressInput from '../form/AddressInput'
import { useSearchBelieverModalStore } from './SearchBelieverModal'
import { useUpdateEffect } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Table,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'

type BelieverModalStoreType = {
  believer?: { id: string; name: string }
  isOpen: boolean
  onOpen: (believer?: { id: string; name: string }) => void
  onClose: () => void
}

export const useBelieverModalStore = create<BelieverModalStoreType>((set) => ({
  believer: undefined,
  isOpen: false,
  onOpen: (believer) => set({ isOpen: true, believer }),
  onClose: () => set({ isOpen: false }),
}))

type DataType = Override<
  GetArrType<TrpcOutputs['believer']['getBelieverById']['data']>,
  { key: string; birthday: dayjs.Dayjs }
>

type CreateFormData = Override<
  TrpcInputs['believer']['createBeliever'],
  {
    birthday: Dayjs
  }
>

function CreateBelieverModal() {
  const { isOpen, onClose, believer, onOpen } = useBelieverModalStore()

  const {
    onOpen: openSearchBelieverModal,
    setBeliever: setSearchBeleiverModelBeliever,
  } = useSearchBelieverModalStore()

  const [form] = Form.useForm<CreateFormData>()
  const [editKey, setEditKey] = useState<string | null>(null)
  const { message } = useAntd()

  const {
    data: result,
    isFetching,
    isError,
  } = trpcQuery.believer.getBelieverById.useQuery(believer?.id as string, {
    enabled: !!believer?.id,
  })
  const data = result?.data || []
  const parent = result?.parent

  const utils = trpcQuery.useUtils()

  const [newBeliever, setNewBeliever] = useState<DataType[]>([])
  const handleAdd = () => {
    setNewBeliever([
      {
        key: `new${newBeliever.length + 1}`,
        id: '',
        rank: 0,
        name: '',
        birthday: dayjs(),
        address: '',
        phone: '',
        gender: '',
      },
    ])
    form.setFieldsValue({
      name: '新信眾',
      birthday: dayjs(),
      address: parent?.address || '',
      phone: '0912345678',
      gender: '男',
    })
    setEditKey(null)
  }

  const handleEdit = async () => {
    const values = await form.validateFields()
    await trpcClient.believer.updateBeliever.mutate({
      ...values,
      id: editKey as string,
      birthday: dayjs(values.birthday).format('YYYY-MM-DD HH:mm:ss'),
    })
    form.resetFields()
    utils.believer.invalidate()
    message.success('更新成功')
    setEditKey(null)
  }
  const handleCreate = async () => {
    const { birthday, ...values } = await form.validateFields()
    const newBeliever = await trpcClient.believer.createBeliever.mutate({
      ...values,
      birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
      parentId: parent?.id || null,
    })
    setNewBeliever([])
    form.resetFields()
    utils.believer.invalidate()
    message.success('新增成功')
    onClose()
    onOpen(newBeliever)
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '名字',
      dataIndex: 'name',
      width: '120px',
      render: (_, props) => {
        if (props.key.startsWith('new') || props.key === editKey) {
          return (
            <Form.Item
              className="mb-0"
              name="name"
              rules={[{ required: true, message: '請輸入名字' }]}
            >
              <Input autoFocus />
            </Form.Item>
          )
        }
        return <div>{props.name}</div>
      },
    },
    {
      title: '電話',
      dataIndex: 'phone',
      width: '140px',
      render: (_, props) => {
        if (props.key.startsWith('new') || props.key === editKey) {
          return (
            <Form.Item
              className="mb-0"
              name="phone"
              rules={[{ required: true, message: '輸入電話' }]}
            >
              <Input />
            </Form.Item>
          )
        }
        return <div>{props.phone}</div>
      },
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      width: '200px',
      render: (_, props) => {
        if (props.key.startsWith('new') || props.key === editKey) {
          return (
            <Form.Item
              className="mb-0"
              name="birthday"
              rules={[{ required: true, message: '請輸入生日' }]}
            >
              <DatePicker
                format={'YYYY-MM-DD HH:mm:ss'}
                className="w-full"
                showTime
              />
            </Form.Item>
          )
        }

        return <div>{dayjs(props.birthday).format('YYYY-MM-DD HH:mm:ss')}</div>
      },
    },
    {
      title: '性別',
      width: '60px',
      dataIndex: 'gender',

      render: (_, props) => {
        if (props.key.startsWith('new') || props.key === editKey) {
          return (
            <Form.Item
              className="mb-0"
              name="gender"
              rules={[{ required: true, message: '請輸入性別' }]}
            >
              <Select
                options={[
                  { value: '男', label: '男' },
                  { value: '女', label: '女' },
                  { value: '其他', label: '其他' },
                ]}
                placeholder="性別"
              />
            </Form.Item>
          )
        }
        return <div>{props.gender}</div>
      },
    },
    {
      title: '地址',
      dataIndex: 'address',
      render: (_, props) => {
        if (props.key.startsWith('new') || props.key === editKey) {
          return (
            <AddressInput
              className="mb-0"
              form={form}
              name={'address'}
              label={false}
              direction="col"
            />
          )
        }
        return <div>{props.address}</div>
      },
    },
    {
      title: '操作',
      width: '90px',
      render: (_, props) => {
        if (props.key.startsWith('new')) {
          return (
            <div className="flex flex-col gap-2">
              <Button type="primary" onClick={handleCreate}>
                新增
              </Button>
              <ExtendedButton
                onClick={() => setNewBeliever([])}
                htmlType="button"
                type="info"
              >
                放棄
              </ExtendedButton>
            </div>
          )
        }
        if (props.key === editKey) {
          return (
            <div className="flex flex-col gap-2">
              <ExtendedButton
                onClick={handleEdit}
                htmlType="button"
                type="primary"
              >
                完成
              </ExtendedButton>
              <ExtendedButton
                onClick={() => setEditKey(null)}
                htmlType="button"
                type="info"
              >
                放棄
              </ExtendedButton>
            </div>
          )
        }
        return (
          <>
            <DropdownButton>
              <ExtendedButton
                onClick={() => {
                  setEditKey(props.key)
                  form.setFieldsValue({
                    name: props.name,
                    birthday: props.birthday,
                    phone: props.phone,
                    gender: props.gender,
                    address: props.address,
                  })
                  setNewBeliever([])
                }}
                type="primary"
              >
                編輯
              </ExtendedButton>
              {(props.key !== parent?.id || data.length === 1) && (
                <ExtendedButton
                  onClick={() => {
                    setSearchBeleiverModelBeliever({
                      id: props.id,
                      name: props.name,
                    })
                    openSearchBelieverModal('changeParent')
                  }}
                  type="primary"
                >
                  更換戶長
                </ExtendedButton>
              )}
            </DropdownButton>
          </>
        )
      },
    },
  ]
  const dataSource = data
    .map((item) => ({
      ...item,
      key: item.id,
      birthday: dayjs(item.birthday),
    }))
    .concat(newBeliever)

  return (
    <>
      <Modal
        destroyOnClose
        title={believer ? `信眾:${believer?.name}` : `信眾`}
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
          <div className="flex w-full justify-center">
            <Spin />
          </div>
        ) : (
          <>
            <Form form={form}>
              <Button onClick={handleAdd}>增加</Button>
              <Table
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: [parent?.id || ('' as React.Key)],
                  onChange: async (selectedRowKeys: React.Key[]) => {
                    const id = selectedRowKeys[0] as string
                    await trpcClient.believer.changeParentIdByBelieverId.mutate(
                      id,
                    )
                    utils.believer.invalidate()
                    message.success('更新成功')
                    //todo 更新父親id
                  },
                  getCheckboxProps: (record) => ({
                    disabled: record.key.startsWith('new'),
                  }),
                }}
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 5 }}
              />
            </Form>
          </>
        )}
      </Modal>
    </>
  )
}

export default CreateBelieverModal
