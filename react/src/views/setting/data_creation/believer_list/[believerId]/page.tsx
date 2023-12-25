import ChangeSizeRadio from '@/components/ChangeSizeRadio'
import Group from '@/components/Group'
import Loading from '@/components/Loading'
import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import PrevButton from '@/components/buttons/PrevButton'
import Container from '@/components/container/Container'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcOutputs } from '@/types/trpc'
import {
  DatePicker,
  Form,
  Input,
  Table,
  Cascader,
  Radio,
  Space,
  Button,
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import lunisolar from 'lunisolar'
import { useNavigate, useParams } from 'react-router-dom'

type DataType = TrpcOutputs['believer']['getBelieverById']

const CustomerIdPage = () => {
  const id = useParams().believerId as string
  const [form] = Form.useForm<Override<DataType, { birthday: Dayjs }>>()
  const { message } = useAntd()
  const navigate = useNavigate()
  const utils = trpcQuery.useUtils()
  const { data, refetch, isLoading } =
    trpcQuery.believer.getBelieverById.useQuery({ id })
  const d = lunisolar(data?.birthday)
  const birthday = dayjs(data?.birthday)
  const { mutate: update } = trpcQuery.believer.updateBeliever.useMutation({
    onSuccess: () => {
      utils.believer.getBelievers.invalidate()
      refetch()
      message.success('更新成功')
      navigate(-1)
    },
  })
  if (isLoading) return <Loading />

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const updateData = {
        ...values,
        id,
        birthday: values.birthday.format('YYYY-MM-DD HH:mm:ss'),
      }
      update(updateData)
    } catch (error: any) {
      console.log(error)
      const firstName = error?.errorFields[0]?.name
      form.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }

  return (
    <Container>
      <MyCard title="信眾資料">
        <Form
          form={form}
          layout={'vertical'}
          initialValues={{ ...data, birthday }}
        >
          <div className="flex justify-end gap-2">
            <PrevButton />
            <ChangeSizeRadio />
          </div>
          <Group>
            <Form.Item rules={[{ required: true }]} label="姓名" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="電話" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="地址" name="address">
              <Input />
            </Form.Item>
            <Form.Item label="性別" name="gender">
              <Radio.Group>
                <Radio value={'男'}>男</Radio>
                <Radio value={'女'}>女</Radio>
                <Radio value={'其他'}>其他</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="生日" name="birthday">
              <DatePicker
                format={'YYYY-MM-DD HH:mm:ss'}
                className="w-full"
                showTime
              />
            </Form.Item>
            <Form.Item label="八字">
              <Input value={d.format('cY cM cD cH')} disabled />
            </Form.Item>
            <Form.Item label="農曆年">
              <Input value={d.format('cY年 lM(lL)lD lH時')} disabled />
            </Form.Item>
          </Group>
          <Form.Item className="col-span-full flex justify-center">
            <ExtendedButton
              onClick={handleSubmit}
              type="primary"
              htmlType="submit"
            >
              修改
            </ExtendedButton>
          </Form.Item>
        </Form>
      </MyCard>
    </Container>
  )
}

export default CustomerIdPage

function ServiceTable() {
  const dataSource = [
    {
      number: 'H0000000009',
      year: '110',
      date: '110年11月11日',
      totalCount: 2000,
    },
    {
      number: 'H0000000010',
      year: '111',
      date: '111年03月21日',
      totalCount: 2140,
    },
    {
      number: 'H0000000011',
      year: '112',
      date: '112年07月03日',
      totalCount: 1200,
    },
  ]

  const columns: ColumnsType<any> = [
    {
      title: '編號',
      render: (_, props) => {
        return <a href="#">{props.number}</a>
      },
    },
    {
      title: '年度',
      dataIndex: 'year',
    },

    {
      title: '日期',
      dataIndex: 'date',
    },

    {
      title: '總金額',
      dataIndex: 'totalCount',
    },
  ]

  return (
    <Table
      bordered
      dataSource={dataSource}
      columns={columns}
      pagination={false}
    />
  )
}
