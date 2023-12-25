import ExtendedButton from '@/components/buttons/ExtendedButton'
import TableTemplate from '@/components/table/TableTemplate'
import { trpcQuery } from '@/provider/TrpcProvider'
import { Tag } from 'antd'
import { Button, Modal, Form } from 'antd'
import Input from 'antd/es/input/Input'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Page = () => {
  const [form] = Form.useForm<{ roleName: string }>()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data, isLoading, refetch } = trpcQuery.permission.getRoles.useQuery()

  const { mutate: createMutate } = trpcQuery.permission.createRole.useMutation({
    onSuccess: (id) => {
      navigate(id)
      setOpen(false)
      refetch()
    },
  })

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '角色名稱',
      dataIndex: 'role',
    },
    {
      title: '狀態',
      render: (role: any) => {
        const style = role.status ? { color: 'success' } : { color: 'warning' }
        const text = role.status ? '啟用' : '停用'
        return <Tag {...style}>{text}</Tag>
      },
    },
    {
      title: '操作',
      render: (role: any) => {
        return (
          <ExtendedButton
            onClick={() => {
              navigate(role.id.toString())
            }}
            type="primary"
          >
            編輯
          </ExtendedButton>
        )
      },
    },
  ]

  const showModal = () => setOpen(true)

  const onOk = async () => {
    const { roleName } = await form.validateFields()
    createMutate({ role: roleName })
  }
  const handleCancel = () => setOpen(false)

  const roleNamesArray = data?.map((item) => item.role)

  return (
    <>
      <Modal
        open={open}
        title="創建新角色"
        onOk={onOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={onOk}>
            創建
          </Button>,
        ]}
      >
        <Form form={form}>
          <Form.Item
            // initialValue={'分行主管'}
            name="roleName"
            label="角色名稱"
            rules={[
              {
                required: true,
                validator(rule, roleName: string, callback) {
                  if (roleName) {
                    const isRoleNameExists = roleNamesArray?.includes(roleName)
                    if (isRoleNameExists) {
                      callback('角色名稱已存在')
                    }
                    callback()
                  } else {
                    callback('請輸入角色名稱')
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <TableTemplate
        tableTopContent={
          <div className="flex justify-end">
            <ExtendedButton type="primary" onClick={showModal}>
              創建新角色
            </ExtendedButton>
          </div>
        }
        data={data || []}
        columns={columns}
        templateTableProps={{ width: 110, align: 'center' }}
        loading={isLoading}
        pagination={false}
      />
    </>
  )
}

export default Page
