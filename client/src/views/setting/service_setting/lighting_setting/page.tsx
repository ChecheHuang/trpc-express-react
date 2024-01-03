import { Form, Input, Table } from 'antd'
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
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'

import CreateLightDetailModal from './_components/CreateLightDetailModal'
import CreateLightModal from './_components/CreateLightModal'
import DeleteLightButton from './_components/DeleteLightButton'
import DeleteLightDetailButton from './_components/DeleteLightDetailButton'

type DataType = GetArrType<TrpcOutputs['service']['getLights']>

const LightingSetting = () => {
  const [form] = Form.useForm<TrpcInputs['service']['updateLight']>()
  const [editKey, setEditKey] = useState<string | null>(null)
  const [showLightKey, setShowLightKey] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data, isLoading, refetch } = trpcQuery.service.getLights.useQuery()
  const { mutate: updateLight } = trpcQuery.service.updateLight.useMutation({
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
      updateLight(values)
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
      width: '30%',
      dataIndex: 'name',
      render: (_, props) => {
        if (props.id === editKey) {
          return (
            <Form.Item
              name="name"
              rules={[{ required: true, message: '請輸入燈別' }]}
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
      width: '30%',
    },
    {
      title: '價格',
      dataIndex: 'price',
      width: '25%',
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
            <DeleteLightButton id={props.id} name={props.name} />
          </DropdownButton>
        )
      },
    },
  ]
  const detailsData = useMemo(() => {
    if (!data) return []
    const result = data.reduce(
      (acc, { id, lightDetails }) => {
        acc[id] = lightDetails
        return acc
      },
      {} as Record<string, DataType['lightDetails']>,
    )
    return result[showLightKey] || []
  }, [data, showLightKey])

  if (isLoading) return <Loading />
  return (
    <>
      <CreateLightModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <Container>
        <MyCard>
          <div className="grid grid-cols-2 gap-2">
            {/* Left */}
            <div>
              <div className="mb-2  flex justify-around">
                <h1>燈別名稱</h1>
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
                      setShowLightKey(selectedRowKeys[0] as string)
                      setEditKey(null)
                    },
                  }}
                  pagination={false}
                />
              </Form>
            </div>
            {/* Right */}
            <Right lightId={showLightKey} data={detailsData} />
          </div>
        </MyCard>
      </Container>
    </>
  )
}

export default LightingSetting

const Right = ({
  lightId,
  data: detailsData,
}: {
  lightId: string
  data: DataType['lightDetails']
}) => {
  const [editKey, setEditKey] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [form] = Form.useForm<TrpcInputs['service']['updateLightDetail']>()
  const { message } = useAntd()
  const { windowHeight } = useWindowInfo()
  const utils = trpcQuery.useUtils()
  const { mutate: updateLightDetail } =
    trpcQuery.service.updateLightDetail.useMutation({
      onSuccess: () => {
        message.success('修改成功')
        utils.service.getLights.invalidate()
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
      updateLightDetail(values)
    } catch (error: any) {
      const firstName = error?.errorFields[0]?.name
      form.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }

  const detailsColumns: ColumnsType<GetArrType<DataType['lightDetails']>> = [
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
            <DeleteLightDetailButton id={props.id} name={props.name} />
          </DropdownButton>
        )
      },
    },
  ]
  return (
    <>
      <CreateLightDetailModal
        lightId={lightId}
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <div>
        <div className="mb-2  flex justify-around">
          <h1>燈座編號</h1>
          <ExtendedButton
            disabled={!lightId}
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
