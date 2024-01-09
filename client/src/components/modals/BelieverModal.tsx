import { Button, Form, Modal, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import React, { useState } from 'react'
import { create } from 'zustand'

import DropdownButton from '@/components/buttons/DropdownButton'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import FormItems from '@/components/form/FormItems'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import {
  TrpcInputs,
  TrpcOutputs,
  trpcClient,
  trpcQuery,
} from '@/provider/TrpcProvider'

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

type CreateFormType = Prettify<
  Override<
    TrpcInputs['believer']['createBeliever'],
    {
      birthday: Dayjs
    }
  >
>

type UpdateFormType = Prettify<
  Override<
    TrpcInputs['believer']['updateBeliever'],
    {
      birthday: Dayjs
    }
  >
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

  const { data: result, isFetching } =
    trpcQuery.believer.getBelieverById.useQuery(believer?.id as string, {
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
        if (props.key === editKey)
          return <FormItems.Name className="mb-0" label={null} />
        return <div>{props.name}</div>
      },
    },
    {
      title: '電話',
      dataIndex: 'phone',
      width: '140px',
      render: (_, props) => {
        if (props.key === editKey)
          return <FormItems.Phone className="mb-0" label={null} />
        return <div>{props.phone}</div>
      },
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      width: '130px',
      render: (_, props) => {
        if (props.key === editKey)
          return <FormItems.Birthday className="mb-0" label={null} />

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
            <FormItems.GenderSelect className="mx-[0px] mb-0" label={null} />
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
            <FormItems.Address
              className="mb-0"
              form={updateForm}
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
        style={{ top: 20 }}
        destroyOnClose
        title={believer ? `信眾:${believer?.name}` : `信眾`}
        onCancel={onClose}
        open={isOpen}
        width={900}
        footer={[
          <Button key="ok" type="primary" onClick={onClose}>
            關閉
          </Button>,
        ]}
      >
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
            <FormItems.Name />
            <FormItems.Phone />
            <FormItems.Birthday />
            <FormItems.GenderSelect />
            <FormItems.Address
              className="col-span-full"
              form={createForm}
              direction="col"
            />
          </Form>
        </Modal>
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
