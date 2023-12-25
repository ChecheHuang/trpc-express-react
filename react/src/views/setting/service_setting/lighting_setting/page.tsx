import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import Container from '@/components/container/Container'
import { useAntd } from '@/provider/AntdProvider'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { FC, useMemo, useRef, useState } from 'react'
import { ColumnsType } from 'antd/es/table'
import { Form, FormInstance, Table, Input } from 'antd'
import DropdownButton from '@/components/buttons/DropdownButton'

const LightingSetting: FC = () => {
  const [showLightKey, setShowLightKey] = useState<string>('')

  return (
    <Container>
      <MyCard>
        <div className="grid grid-cols-2 gap-2">
          <Left setShowLightKey={setShowLightKey} />
          <Right showLightKey={showLightKey} />
        </div>
      </MyCard>
    </Container>
  )
}

export default LightingSetting

interface leftProps {
  setShowLightKey: React.Dispatch<React.SetStateAction<string>>
}
type LeftFakeData = {
  key: string
  name: string
  sort: string
  price: number
}
const Left: FC<leftProps> = ({ setShowLightKey }) => {
  const formRef = useRef<FormInstance>(null)
  const { message, modal } = useAntd()
  const [editKey, setEditKey] = useState<string>('')
  const [tableData, setTableData] = useState<LeftFakeData[]>([
    {
      key: '光明燈-A',
      name: '光明燈-A',
      sort: '光右-1-01',
      price: 1500,
    },
    {
      key: '文昌燈',
      name: '文昌燈',
      sort: '文1-05',
      price: 500,
    },
    {
      key: '財神燈',
      name: '財神燈',
      sort: '文1-05',
      price: 500,
    },
    {
      key: '光明燈-B',
      name: '光明燈-B',
      sort: '光右-2-05',
      price: 500,
    },
  ])
  const columns: ColumnsType<LeftFakeData> = [
    {
      title: '名稱',
      key: 'name',
      width: '25%',
      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <Form.Item
            name="name"
            rules={[{ required: true, message: '請輸入燈別' }]}
          >
            <Input autoFocus />
          </Form.Item>
        ) : (
          <div>{props.name}</div>
        )
      },
    },
    {
      title: '目前燈號',
      key: 'sort',
      dataIndex: 'sort',
      width: '25%',
    },
    {
      title: '價格',
      key: 'price',
      width: '25%',

      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <Form.Item
            name="price"
            rules={[{ required: true, message: '請輸入價格' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <div>{props.price}</div>
        )
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: '25%',

      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <ExtendedButton htmlType="submit" type="primary">
            完成
          </ExtendedButton>
        ) : (
          <DropdownButton>
            <ExtendedButton
              onClick={() => {
                setEditKey(props.key)
                formRef.current?.setFieldsValue({
                  name: props.name,
                  price: props.price,
                })
              }}
              type="info"
            >
              編輯
            </ExtendedButton>
            <ExtendedButton
              onClick={() => {
                // console.log(props.key)
                modal?.confirm({
                  title: <div>{props.name}</div>,
                  icon: <ExclamationCircleOutlined />,
                  content: '刪除資料不可回復，確認刪除?',
                  okText: '確認',
                  cancelText: '取消',
                  onOk: () => {
                    setTableData((prev) => {
                      return prev.filter((item) => {
                        return item.key !== props.key
                      })
                    })
                    message.info('刪除成功')
                  },
                })
              }}
              type="primary"
              danger
            >
              刪除
            </ExtendedButton>
          </DropdownButton>
        )
      },
    },
  ]

  const onFinish =
    (status: 'add' | 'edit') =>
    ({ name, price }: Pick<LeftFakeData, 'name' | 'price'>) => {
      let msg = ''
      if (status === 'edit') {
        setEditKey('')
        const newTableData: LeftFakeData[] = tableData.map((data) => {
          if (data.key === editKey) {
            return {
              ...data,
              name,
              price,
            }
          }
          return data
        })
        setTableData(newTableData)
        msg = `${name}修改成功`
      }
      if (status === 'add') {
        setTableData((tableData) => [
          {
            key: name,
            name: name,
            sort: '',
            price: price,
          },
          ...tableData,
        ])
        msg = `${name}新增成功`
      }
      formRef.current?.resetFields()
      message.success(msg)
    }

  const addContent = (
    <Form
      ref={formRef}
      onFinishFailed={() => {
        message.error('新增失敗')
      }}
      onFinish={onFinish('add')}
    >
      <Form.Item
        name="name"
        label="燈別"
        rules={[{ required: true, message: '請輸入燈別' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="price"
        label="價格"
        rules={[{ required: true, message: '請輸入價格' }]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
  return (
    <div>
      <div className="flex  justify-around mb-2">
        <h1>燈別名稱</h1>
        <ExtendedButton
          onClick={() => {
            modal.confirm({
              title: '新增燈別',
              icon: <ExclamationCircleOutlined />,
              content: addContent,
              okText: '確認',
              cancelText: '取消',
              onOk: () => {
                formRef.current?.submit()
              },
            })
          }}
          type="info"
          disabled={editKey !== ''}
        >
          新增
        </ExtendedButton>
      </div>
      <Form onFinish={onFinish('edit')} ref={formRef}>
        <Table
          bordered
          dataSource={tableData}
          columns={columns}
          rowSelection={{
            type: 'radio',
            onChange: (selectedRowKeys: React.Key[]) => {
              setShowLightKey(selectedRowKeys[0] as string)
            },
          }}
        />
      </Form>
    </div>
  )
}
interface RightProps {
  showLightKey: string
}
type RightFakeData = {
  key: string
  name: string
  start: string
  end: string
}
type TableData = { [key: string]: RightFakeData[] }
const Right: FC<RightProps> = ({ showLightKey }) => {
  const formRef = useRef<FormInstance>(null)
  const { message, modal } = useAntd()
  const [editKey, setEditKey] = useState<string>('')
  const [tableData, setTableData] = useState<TableData>({
    '光明燈-A': [
      {
        key: '光右-2',
        name: '光右-2',
        start: '01',
        end: '06',
      },
      {
        key: '光左-2',
        name: '光左-2',
        start: '01',
        end: '06',
      },
      {
        key: '光右-3',
        name: '光右-3',
        start: '01',
        end: '07',
      },
      {
        key: '光左-3',
        name: '光左-3',
        start: '01',
        end: '07',
      },
    ],
    文昌燈: [
      {
        key: '光右-3',
        name: '光右-3',
        start: '01',
        end: '06',
      },
      {
        key: '光左-3',
        name: '光左-3',
        start: '01',
        end: '06',
      },
      {
        key: '光右-4',
        name: '光右-4',
        start: '01',
        end: '07',
      },
    ],
    財神燈: [
      {
        key: '光右-5',
        name: '光右-5',
        start: '01',
        end: '07',
      },
      {
        key: '光左-5',
        name: '光左-5',
        start: '01',
        end: '07',
      },
    ],
    '光明燈-B': [
      {
        key: '光右-6',
        name: '光右-6',
        start: '01',
        end: '07',
      },
    ],
  })
  const columns: ColumnsType<RightFakeData> = [
    {
      title: '排序',
      rowScope: 'row',
      width: '20%',
      render: (_, props, index) => {
        return <div>{index + 1}</div>
      },
    },
    {
      title: '燈座名稱',
      key: 'name',
      width: '20%',
      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <Form.Item
            name="name"
            rules={[{ required: true, message: '請輸入燈座' }]}
          >
            <Input autoFocus />
          </Form.Item>
        ) : (
          <div>{props.name}</div>
        )
      },
    },
    {
      title: '開始',
      key: 'start',
      width: '20%',
      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <Form.Item
            name="start"
            rules={[{ required: true, message: '請輸入開始' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <div>{props.start}</div>
        )
      },
    },
    {
      title: '結束',
      key: 'end',
      width: '20%',
      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <Form.Item
            name="end"
            rules={[{ required: true, message: '請輸入結束' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <div>{props.end}</div>
        )
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: '20%',

      render: (_, props) => {
        const isEdit = props.key === editKey
        return isEdit ? (
          <ExtendedButton htmlType="submit" type="primary">
            完成
          </ExtendedButton>
        ) : (
          <DropdownButton>
            <ExtendedButton
              onClick={() => {
                setEditKey(props.key)
                formRef.current?.setFieldsValue({
                  name: props.name,
                  start: props.start,
                  end: props.end,
                })
              }}
              type="info"
            >
              編輯
            </ExtendedButton>
            <ExtendedButton
              onClick={() => {
                modal?.confirm({
                  title: <div>{props.name}</div>,
                  icon: <ExclamationCircleOutlined />,
                  content: '刪除資料不可回復，確認刪除?',
                  okText: '確認',
                  cancelText: '取消',
                  onOk: () => {
                    setTableData((prev) => {
                      const newState = { ...prev }
                      const showData = newState[showLightKey] || []
                      const newShowData = showData.filter(
                        (data) => data.key !== props.key
                      )
                      newState[showLightKey] = newShowData
                      return newState
                    })
                    message.info('刪除成功')
                  },
                })
              }}
              type="primary"
              danger
            >
              刪除
            </ExtendedButton>
          </DropdownButton>
        )
      },
    },
  ]

  const onFinish =
    (status: 'add' | 'edit') =>
    ({ name, start, end }: Pick<RightFakeData, 'name' | 'start' | 'end'>) => {
      let msg = ''
      if (status === 'edit') {
        setEditKey('')
        setTableData((prev) => {
          const newState = { ...prev }
          const showData = newState[showLightKey] || []
          newState[showLightKey] = showData.map((data) => {
            if (data.key === editKey) {
              return {
                ...data,
                name,
                start,
                end,
              }
            }
            return data
          })
          return newState
        })
        msg = `${name}修改成功`
      }
      if (status === 'add') {
        setTableData((prev) => {
          const newState = { ...prev }
          const showData = newState[showLightKey] || []
          newState[showLightKey] = [
            ...showData,
            {
              key: name,
              name,
              start,
              end,
            },
          ]
          return newState
        })

        msg = `${name}新增成功`
      }
      formRef.current?.resetFields()
      message.success(msg)
    }

  const addContent = (
    <Form
      labelCol={{ span: 6 }}
      ref={formRef}
      onFinishFailed={() => {
        message.error('新增失敗')
      }}
      onFinish={onFinish('add')}
    >
      <Form.Item
        name="name"
        label="燈座名稱"
        rules={[{ required: true, message: '請輸入燈座名稱' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="start"
        label="開始"
        rules={[{ required: true, message: '請輸入開始' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="end"
        label="結束"
        rules={[{ required: true, message: '請輸入結束' }]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
  return (
    <>
      <div>
        <div className="flex  justify-around mb-2">
          <h1>
            {showLightKey} <span className="ml-2">燈座編號</span>{' '}
          </h1>
          <ExtendedButton
            onClick={() => {
              modal.confirm({
                title: '新增燈座',
                icon: <ExclamationCircleOutlined />,
                content: addContent,
                okText: '確認',
                cancelText: '取消',
                onOk: () => {
                  formRef.current?.submit()
                },
              })
            }}
            disabled={showLightKey === ''}
            type="info"
          >
            新增
          </ExtendedButton>
        </div>
        <Form onFinish={onFinish('edit')} ref={formRef}>
          <Table
            bordered
            dataSource={tableData[showLightKey]}
            columns={columns}
          />
        </Form>
      </div>
    </>
  )
}
