import ExtendedButton from '@/components/buttons/ExtendedButton'
import TableTemplate from '@/components/table/TableTemplate'
import useQueryStringObj from '@/hooks/useQueryStringObj'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'
import { useMutation } from '@tanstack/react-query'
import { Tag, Modal, Form, Input, Select } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'

type UserType = GetArrType<TrpcOutputs['permission']['usersWithRoles']['data']>

type SearchType = TrpcInputs['permission']['usersWithRoles']
type UserFormType<T extends ModelStatus> = T extends '編輯'
  ? {
      name: string
      roles: string[]
      userId: string
    }
  : { name: string; roles: string[]; password: string }

type ModelStatus = '編輯' | '新增'

const initSearchValue: SearchType = {
  _page: '1',
  _limit: '10',
}

const Page = () => {
  const [searchValue, setSearchValue] =
    useQueryStringObj<SearchType>(initSearchValue)
  const [open, setOpen] = useState(false)
  const [modelStatus, setModelStatus] = useState<ModelStatus>('編輯')
  const [form] = Form.useForm<UserFormType<typeof modelStatus>>()
  const { message } = useAntd()

  const { data, refetch: getUsersRefetch } =
    trpcQuery.permission.usersWithRoles.useQuery(
      {
        ...searchValue,
      },
      {
        placeholderData: { data: [], total: 0 },
        keepPreviousData: true,
      },
    )
  const { mutate, isLoading: isMutateLoading } = useMutation({
    mutationFn: async () => {
      const value = await form.validateFields()
      if (modelStatus === '新增') {
        const newValue = value as UserFormType<'新增'>
        await trpcClient.permission.createUser.mutate(newValue)
      }
      if (modelStatus === '編輯') {
        const newValue = value as UserFormType<'編輯'>
        await trpcClient.permission.updateUser.mutate(newValue)
      }
    },
    onSuccess: () => {
      message.success(`${modelStatus}成功`)
      getUsersRefetch()
      setOpen(false)
    },
  })

  const { data: options } = trpcQuery.permission.rolesOption.useQuery()

  const handleCancel = () => setOpen(false)
  const isStatusEqualCreate = modelStatus === '新增'

  const onOpen = (user?: UserType) => {
    if (!user) {
      setModelStatus('新增')
      form.resetFields()
    }
    if (user) {
      setModelStatus('編輯')
      const { name, roles, id } = user
      const optionsRoles = roles.map((item) => item.id)
      form.setFieldsValue({
        userId: id,
        name,
        roles: optionsRoles,
      })
    }
    setOpen(true)
  }

  const columns: ColumnsType<UserType> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '名稱',
      dataIndex: 'name',
    },

    {
      title: '角色',
      render: (user: UserType) => {
        return (
          <div className="flex flex-wrap justify-start gap-2">
            {user.roles.map(({ id, role }) => (
              <Tag key={id}>{role}</Tag>
            ))}
          </div>
        )
      },
    },
    {
      title: '操作',
      render: (user: UserType) => {
        return (
          <ExtendedButton onClick={() => onOpen(user)} type="primary">
            編輯
          </ExtendedButton>
        )
      },
    },
  ]
  return (
    <>
      <Modal
        open={open}
        title={modelStatus}
        onCancel={handleCancel}
        footer={[
          <ExtendedButton key="back" onClick={handleCancel}>
            取消
          </ExtendedButton>,
          <ExtendedButton
            key="submit"
            type="primary"
            disabled={isMutateLoading}
            onClick={() => mutate()}
          >
            {isStatusEqualCreate ? '新增' : '修改'}
          </ExtendedButton>,
        ]}
      >
        <Form form={form}>
          <Form.Item name="name" label="帳號">
            <Input />
          </Form.Item>
          {isStatusEqualCreate ? (
            <>
              <Form.Item name="password" label="密碼">
                <Input />
              </Form.Item>
            </>
          ) : (
            <Form.Item className="hidden" name="userId">
              <Input />
            </Form.Item>
          )}
          <Form.Item name="roles" label="角色">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="選擇角色"
              options={options}
            />
          </Form.Item>
        </Form>
      </Modal>
      <TableTemplate
        tableTopContent={
          <div className="flex justify-end">
            <ExtendedButton onClick={() => onOpen()} type="primary">
              新增
            </ExtendedButton>
          </div>
        }
        data={data?.data || []}
        columns={columns}
        templateTableProps={{
          align: 'left',
        }}
        pagination={{
          position: ['bottomCenter'],
          pageSize: parseInt(searchValue?._limit || '10'),
          total: data?.total || 0,
          current: parseInt(searchValue?._page || '1'),
        }}
        onPaginate={(paginationInfo: TablePaginationConfig) => {
          const _page = paginationInfo.current?.toString()
          const _limit = paginationInfo.pageSize?.toString()
          setSearchValue({ ...searchValue, _page, _limit })
        }}
      />
    </>
  )
}

export default Page
