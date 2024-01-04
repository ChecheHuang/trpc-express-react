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

import { useUpdateEffect, useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'

import DropdownButton from '../buttons/DropdownButton'
import ExtendedButton from '../buttons/ExtendedButton'
import AddressInput from '../form/AddressInput'
import { useSearchBelieverModalStore } from './SearchBelieverModal'

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

type CreateFormType = Override<
  TrpcInputs['believer']['createBeliever'],
  {
    birthday: Dayjs
  }
>

type UpdateFormType = Override<
  TrpcInputs['believer']['updateBeliever'],
  {
    birthday: Dayjs
  }
>

function BelieverModal() {
  const { isOpen, onClose, believer, onOpen } = useBelieverModalStore()

  const { windowHeight } = useWindowInfo()

  const {
    onOpen: openSearchBelieverModal,
    setBeliever: setSearchBeleiverModelBeliever,
  } = useSearchBelieverModalStore()

  const [updateForm] = Form.useForm<UpdateFormType>()
  const [createForm] = Form.useForm<CreateFormType>()
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

  const handleEdit = async () => {
    const values = await updateForm.validateFields()
    await trpcClient.believer.updateBeliever.mutate({
      ...values,
      id: editKey as string,
      birthday: dayjs(values.birthday).format('YYYY-MM-DD HH:mm:ss'),
    })
    updateForm.resetFields()
    utils.believer.invalidate()
    message.success('更新成功')
    setEditKey(null)
  }
  const handleCreate = async () => {
    const { birthday, ...values } = await createForm.validateFields()
    const newBeliever = await trpcClient.believer.createBeliever.mutate({
      ...values,
      birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
      parentId: parent?.id || null,
    })
    createForm.resetFields()
    utils.believer.invalidate()
    message.success('新增成功')
    onClose()
    setIsCreateModalOpen(false)
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
        if (props.key === editKey) {
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
      width: '130px',
      render: (_, props) => {
        if (props.key === editKey) {
          return (
            <Form.Item
              className="mb-0"
              name="birthday"
              rules={[{ required: true, message: '請輸入生日' }]}
            >
              <DatePicker format={'YYYY-MM-DD '} className="w-full" />
            </Form.Item>
          )
        }

        return <div>{dayjs(props.birthday).format('YYYY-MM-DD')}</div>
      },
    },
    {
      title: '性別',
      width: '60px',
      dataIndex: 'gender',

      render: (_, props) => {
        if (props.key === editKey) {
          return (
            <Form.Item
              className="mx-[0px] mb-0"
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
        if (props.key === editKey) {
          return (
            <AddressInput
              className="mb-0"
              form={updateForm}
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
                  updateForm.setFieldsValue({
                    name: props.name,
                    birthday: props.birthday,
                    phone: props.phone,
                    gender: props.gender,
                    address: props.address,
                  })
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
                  轉移至其他戶
                </ExtendedButton>
              )}
            </DropdownButton>
          </>
        )
      },
    },
  ]

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <>
      <Modal
        title="新增信眾"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          createForm.resetFields()
          setIsCreateModalOpen(false)
        }}
      >
        <Form form={createForm} className="grid grid-cols-2 gap-x-2">
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '輸入姓名' }]}
          >
            <Input placeholder="請輸入姓名" autoFocus />
          </Form.Item>
          <Form.Item
            label="電話"
            name="phone"
            rules={[{ required: true, message: '輸入電話' }]}
          >
            <Input placeholder="輸入電話" />
          </Form.Item>
          <Form.Item
            label="生日"
            name="birthday"
            rules={[{ required: true, message: '輸入生日' }]}
          >
            <DatePicker
              className="w-full"
              format={'YYYY-MM-DD HH:mm:ss'}
              showTime
            />
          </Form.Item>
          <Form.Item
            label="性別"
            name="gender"
            rules={[{ required: true, message: '選擇性別' }]}
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
          <AddressInput
            className="col-span-full"
            form={updateForm}
            name={'address'}
            label={'地址'}
            direction="col"
          />
        </Form>
      </Modal>
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
        <Form form={updateForm}>
          <div className="mb-2 flex justify-end">
            <ExtendedButton
              type="info"
              onClick={() => setIsCreateModalOpen(true)}
            >
              新增信眾至該戶
            </ExtendedButton>
          </div>
          <Table
            className="td-no-padding"
            scroll={{ y: windowHeight - 230 }}
            loading={isFetching}
            rowSelection={{
              columnTitle: (
                <div>
                  戶長
                  <br />
                  (勾選)
                </div>
              ),
              columnWidth: '55px',
              type: 'radio',
              selectedRowKeys: [parent?.id || ('' as React.Key)],
              onChange: async (selectedRowKeys: React.Key[]) => {
                const id = selectedRowKeys[0] as string
                await trpcClient.believer.changeParentIdByBelieverIdInSameFamily.mutate(
                  id,
                )
                utils.believer.invalidate()
                message.success('更新成功')
              },
              getCheckboxProps: (record) => ({
                disabled: record.key.startsWith('new'),
              }),
            }}
            columns={columns}
            dataSource={data.map((item) => ({
              ...item,
              key: item.id,
              birthday: dayjs(item.birthday),
            }))}
            pagination={false}
          />
        </Form>
      </Modal>
    </>
  )
}

export default BelieverModal
