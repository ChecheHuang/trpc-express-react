import ChangeSizeRadio from '@/components/ChangeSizeRadio'
import Group from '@/components/Group'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import PrevButton from '@/components/buttons/PrevButton'
import StepContainer from '@/components/container/StepContainer/StepContainer'
import { useInput } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Input, Form, TreeSelect, Cascader, DatePicker, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const { RangePicker } = DatePicker

type FakeData = {
  key: string
  name: string
  sort: number
}
const TempleSetting: FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<number>(1)

  const handlePrevious = (prevStep: number) => {
    setCurrentStep(prevStep)
  }

  const handleNext = (nextStep: number) => {
    setCurrentStep(nextStep)
  }
  const onChange = (step: number) => {
    setCurrentStep(step)
  }
  const [tableData, setTableData] = useState<FakeData[]>([
    {
      key: uuidv4(),
      name: '主任委員',
      sort: 1,
    },
    {
      key: uuidv4(),
      name: '副主任委員',
      sort: 2,
    },
  ])
  const { inputProps, reset } = useInput('')

  const { message, modal } = useAntd()
  const columns: ColumnsType<FakeData> = [
    {
      title: '職稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, props) => {
        return (
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
                },
              })
            }}
            type="primary"
            danger
          >
            刪除
          </ExtendedButton>
        )
      },
    },
  ]
  const onFinish = (values: any) => {
    console.log('Success:', values)
    message.success('成功更新')
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <>
      <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <StepContainer
          currentStep={currentStep}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onChange={onChange}
          onComplete={() => {
            message.success('完成')
            navigate(-1)
          }}
        >
          <div className=" flex items-center justify-between">
            <h1 className="text-3xl">宮廟設定</h1>
            <div className="flex gap-2">
              <PrevButton />
              <ChangeSizeRadio />
            </div>
          </div>
          <StepContainer.Item title="宮廟資料設定">
            <Group
              groupTitle="宮廟資料設定"
              id="first"
              aria-label="宮廟資料設定"
            >
              <Form.Item
                label="宮廟名稱"
                initialValue={'海光宮'}
                name="templeName"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="電話"
                initialValue={'0912345678'}
                name="templePhone"
              >
                <Input />
              </Form.Item>
              <Form.Item
                initialValue={'王主委'}
                label="聯絡人"
                name="templeContact"
              >
                <TreeSelect
                  treeData={[
                    {
                      title: '主委',
                      value: '主委',
                      children: [{ title: '王主委', value: '王主委' }],
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="地址"
                className="templeContactAddress"
                name="templeContactAddress"
                initialValue={['台北市', '板橋區', '大同路']}
              >
                <Cascader
                  options={[
                    {
                      value: '台北市',
                      label: '台北市',
                      children: [
                        {
                          value: '板橋區',
                          label: '板橋區',
                          children: [{ value: '大同路', label: '大同路' }],
                        },
                      ],
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item label="負責期間">
                <RangePicker className="w-full" />
              </Form.Item>
            </Group>
          </StepContainer.Item>
          <StepContainer.Item title="參數設定">
            <Group groupTitle="參數設定" id="參數設定" aria-label="參數設定">
              <Form.Item
                label="服務年度設定"
                initialValue={'112'}
                name="serviceYear"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="服務感謝狀用詞"
                initialValue={'虔誠之心神人感激特以此狀以表謝意'}
                name="templeWord"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="捐獻的年度設定"
                initialValue={'113'}
                name="donationYear"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="捐獻感謝狀用詞"
                initialValue={'虔誠之心神人感激特以此狀以表謝意'}
                name="templeWord"
              >
                <Input />
              </Form.Item>
            </Group>
          </StepContainer.Item>
          <StepContainer.Item title="職稱設定">
            <Group notGlobalCol aria-label="職稱設定">
              <div className="mb-2 flex w-1/3 gap-4">
                <Input {...inputProps} />
                <ExtendedButton
                  type="primary"
                  onClick={() => {
                    setTableData((prev) => [
                      ...prev,
                      {
                        key: uuidv4(),
                        name: inputProps.value,
                        sort: tableData.length + 1,
                      },
                    ])
                    reset()
                  }}
                >
                  新增
                </ExtendedButton>
              </div>
              <Table dataSource={tableData} columns={columns} />
            </Group>
          </StepContainer.Item>
        </StepContainer>
      </Form>
    </>
  )
}

export default TempleSetting
