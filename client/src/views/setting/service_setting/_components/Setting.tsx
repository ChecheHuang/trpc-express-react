import { Button, Form, Input, Modal, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'

import Loading from '@/components/Loading'
import MyCard from '@/components/MyCard'
import DropdownButton from '@/components/buttons/DropdownButton'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import Container from '@/components/container/Container'
import NumberInput from '@/components/form/NumberInput'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery,TrpcInputs, TrpcOutputs } from '@/provider/TrpcProvider'

import CreateDetailModal from './CreateDetailModal'
import DeleteButton from './DeleteButton'
import DeleteDetailButton from './DeleteDetailButton'

type DataType = GetArrType<TrpcOutputs['service']['getServiceByCategory']>

type SettingProps = {
  categoryName: string
  title: string
}

type CreateModalFormType = Omit<
  TrpcInputs['service']['createByCategory'],
  'category'
>

type CreateDetailModalProps = {
  open: boolean
  onClose: () => void
} & SettingProps

const Setting = ({ categoryName, title }: SettingProps) => {
  const [form] = Form.useForm<TrpcInputs['service']['update']>()
  const [editKey, setEditKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data, isLoading, refetch } =
    trpcQuery.service.getServiceByCategory.useQuery(categoryName)
  const { mutate: update } = trpcQuery.service.update.useMutation({
    onSuccess: () => {
      refetch()
      form.resetFields()
      message.success('修改成功')
      setEditKey(null)
    },
  })
  const { message } = useAntd()
  const { windowHeight } = useWindowInfo()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      update(values)
    } catch (error: any) {
      const firstName = error?.errorFields[0]?.name
      form.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }
  const columns: ColumnsType<DataType> = [
    {
      title: '名稱',
      width: '35%',
      dataIndex: 'name',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <Form.Item
              name="name"
              rules={[{ required: true, message: `請輸入${title}` }]}
            >
              <Input autoFocus />
            </Form.Item>
          )
        }
        return <div>{props.name}</div>
      },
    },
    {
      title: '目前燈號',
      dataIndex: 'current',
      width: '28%',
    },
    {
      title: '價格',
      dataIndex: 'price',
      width: '22%',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <Form.Item
              name="price"
              rules={[{ required: true, message: '請輸入價格' }]}
            >
              <NumberInput form={form} name={'price'} />
            </Form.Item>
          )
        }
        return <div>{props.price}</div>
      },
    },
    {
      title: '操作',
      width: '25%',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <div className="flex flex-col gap-2">
              <ExtendedButton
                onClick={handleSubmit}
                htmlType="button"
                type="primary"
              >
                <Form.Item name="id" className="hidden">
                  <Input />
                </Form.Item>
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
          <DropdownButton>
            <ExtendedButton
              onClick={() => {
                setEditKey(props.id)
                form.setFieldsValue({
                  id: props.id,
                  name: props.name,
                  price: props.price,
                })
              }}
              type="info"
            >
              編輯
            </ExtendedButton>
            <DeleteButton id={props.id} name={props.name} />
          </DropdownButton>
        )
      },
    },
  ]
  const detailsData = useMemo(() => {
    if (!data) return []
    const result = data.reduce(
      (acc, { id, details }) => {
        acc[id] = details
        return acc
      },
      {} as Record<string, DataType['details']>,
    )
    return result[showKey] || []
  }, [data, showKey])

  if (isLoading) return <Loading />
  return (
    <>
      <CreateModal
        categoryName={categoryName}
        title={title}
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <Container>
        <MyCard>
          <div className="grid grid-cols-2 gap-2">
            {/* Left */}
            <div>
              <div className="mb-2  flex justify-around">
                <h1>{title}名稱</h1>
                <ExtendedButton
                  onClick={() => {
                    setIsCreateModalOpen(true)
                  }}
                  type="info"
                >
                  新增
                </ExtendedButton>
              </div>
              <Form form={form}>
                <Table
                  scroll={{ y: windowHeight - 250 }}
                  bordered
                  size="small"
                  dataSource={(data || []).map((item) => ({
                    ...item,
                    key: item.id,
                  }))}
                  columns={columns}
                  rowSelection={{
                    type: 'radio',
                    onChange: (selectedRowKeys: React.Key[]) => {
                      setShowKey(selectedRowKeys[0] as string)
                      setEditKey(null)
                    },
                  }}
                  pagination={false}
                />
              </Form>
            </div>
            <SettingDetail id={showKey} data={detailsData} />
          </div>
        </MyCard>
      </Container>
    </>
  )
}

export default Setting

type SettingDetailProps = {
  id: string
  data: DataType['details']
}
const SettingDetail = ({ id, data: detailsData }: SettingDetailProps) => {
  const [editKey, setEditKey] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [form] = Form.useForm<TrpcInputs['service']['updateDetail']>()
  const { message } = useAntd()
  const { windowHeight } = useWindowInfo()
  const utils = trpcQuery.useUtils()
  const { mutate: updateDetail } = trpcQuery.service.updateDetail.useMutation({
    onSuccess: () => {
      message.success('修改成功')
      utils.service.getServiceByCategory.invalidate()
      setEditKey('')
    },
  })
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const { start, end } = values
      if (start > end) {
        message.error('開始不可大於結束')
        return
      }
      updateDetail(values)
    } catch (error: any) {
      const firstName = error?.errorFields[0]?.name
      form.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }

  const detailsColumns: ColumnsType<GetArrType<DataType['details']>> = [
    {
      title: '排序',
      dataIndex: 'rank',
      rowScope: 'row',
      align: 'center',
      width: '13%',
    },
    {
      title: '燈座名稱',
      width: '25%',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <Form.Item
              name="name"
              rules={[{ required: true, message: '請輸入燈座名稱' }]}
            >
              <Input autoFocus />
            </Form.Item>
          )
        }
        return <div>{props.name}</div>
      },
    },
    {
      title: '開始',
      width: '15%',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <Form.Item
              name="start"
              rules={[{ required: true, message: '請輸入開始' }]}
            >
              <NumberInput name="start" form={form} />
            </Form.Item>
          )
        }
        return <div>{props.start}</div>
      },
    },
    {
      title: '結束',
      width: '15%',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <Form.Item
              name="end"
              rules={[{ required: true, message: '請輸入結束' }]}
            >
              <NumberInput name="end" form={form} />
            </Form.Item>
          )
        }
        return <div>{props.end}</div>
      },
    },
    {
      title: '操作',
      width: '20%',

      render: (_, props) => {
        if (props.id === editKey)
          return (
            <div className="flex flex-col gap-2">
              <ExtendedButton
                onClick={handleSubmit}
                htmlType="button"
                type="primary"
              >
                <Form.Item name="id" className="hidden">
                  <Input />
                </Form.Item>
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
        return (
          <DropdownButton>
            <ExtendedButton
              type="info"
              onClick={() => {
                form.setFieldsValue({
                  id: props.id,
                  name: props.name,
                  start: props.start,
                  end: props.end,
                })
                setEditKey(props.id)
              }}
            >
              編輯
            </ExtendedButton>
            <DeleteDetailButton id={props.id} name={props.name} />
          </DropdownButton>
        )
      },
    },
  ]
  return (
    <>
      <CreateDetailModal
        id={id}
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <div>
        <div className="mb-2  flex justify-around">
          <h1>燈座編號</h1>
          <ExtendedButton
            disabled={!id}
            onClick={() => {
              setIsCreateModalOpen(true)
            }}
            type="info"
          >
            新增
          </ExtendedButton>
        </div>
        <Form form={form}>
          <Table
            scroll={{ y: windowHeight - 250 }}
            bordered
            size="small"
            dataSource={detailsData.map((item) => ({ ...item, key: item.id }))}
            columns={detailsColumns}
            pagination={false}
          />
        </Form>
      </div>
    </>
  )
}

const CreateModal = ({
  categoryName,
  open,
  onClose,
  title,
}: CreateDetailModalProps) => {
  const { message } = useAntd()
  const utils = trpcQuery.useUtils()
  const { mutate: create, isLoading: isCreating } =
    trpcQuery.service.createByCategory.useMutation({
      onSuccess: () => {
        message.success('新增成功')
        utils.service.getServiceByCategory.invalidate()
        addForm.resetFields()
        onClose()
      },
    })
  const [addForm] = Form.useForm<CreateModalFormType>()

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields()
      create({ category: categoryName, ...values })
    } catch (error: any) {
      const firstName = error?.errorFields[0]?.name
      addForm.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }
  const handleCancel = () => {
    addForm.resetFields()
    onClose()
  }

  return (
    <Modal
      title={`新增${title}`}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={() => onClose()}>
          取消
        </Button>,
        <Button
          disabled={isCreating}
          key="ok"
          type="primary"
          onClick={handleAdd}
        >
          確定
        </Button>,
      ]}
      width={400}
    >
      <Form form={addForm}>
        <Form.Item
          name="name"
          label={title}
          rules={[{ required: true, message: `請輸入${title}` }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="price"
          label="價格"
          rules={[{ required: true, message: '請輸入價格' }]}
        >
          <NumberInput name="price" form={addForm} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
