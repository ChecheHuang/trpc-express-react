import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { Button, DatePicker, Form, Input, Radio, Select } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Table } from 'antd/lib'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ChangeSizeRadio from '@/components/ChangeSizeRadio'
import Group from '@/components/Group'
import Loading from '@/components/Loading'
import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import PrevButton from '@/components/buttons/PrevButton'
import Container from '@/components/container/Container'
import AddressInput from '@/components/form/AddressInput'
import { useAntd } from '@/provider/AntdProvider'
import { trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { useTheme, SizeType } from '@/store/useTheme'
import { TrpcOutputs } from '@/types/trpc'

type DataType = TrpcOutputs['believer']['getBelieverDetailsById']

const BelieverIdPage = () => {
  const id = useParams().believerId as string
  const [form] = Form.useForm<Override<DataType, { birthday: Dayjs }>>()
  const { size } = useTheme()
  const { message } = useAntd()
  const navigate = useNavigate()
  const utils = trpcQuery.useUtils()

  const {
    data = {
      totalOrders: [],
      id: '',
      name: '',
      phone: '',
      address: '',
      gender: '',
      birthday: '',
      family: [],
    },
    isFetching,
  } = trpcQuery.believer.getBelieverDetailsById.useQuery(id, {
    refetchOnMount: true,
  })
  const { totalOrders, birthday, family, ...rest } = data
  const formData = useMemo(
    () => ({
      ...rest,
      birthday: dayjs(birthday),
    }),
    [rest, birthday],
  )
  useEffect(() => {
    if (!formData?.id) return
    form.setFieldsValue(formData)
  }, [formData, form])

  const items: TabsProps['items'] = totalOrders.map(({ year, orders }) => ({
    key: year.toString(),
    label: year.toString(),
    children: (
      <>
        <ServiceTable orders={orders} />
      </>
    ),
  }))

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const updateData = {
        ...values,
        id,
        birthday: values.birthday.format('YYYY-MM-DD HH:mm:ss'),
      }
      await trpcClient.believer.updateBeliever.mutate(updateData)
      message.success('更新成功')
      utils.believer.invalidate()
    } catch (error: any) {
      console.log(error)
      const firstName = error?.errorFields[0]?.name
      form.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }

  if (isFetching) return <Loading />

  return (
    <Container>
      <MyCard title="信眾資料">
        <Form
          form={form}
          initialValues={formData}
          labelCol={{ span: size !== SizeType.small ? 6 : 12 }}
          layout={size !== SizeType.small ? 'horizontal' : 'vertical'}
        >
          <div className="flex justify-end gap-2">
            <PrevButton />
            <ChangeSizeRadio />
          </div>
          <Group groupTitle="基本資料">
            <Form.Item label="姓名" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="電話" name="phone">
              <Input />
            </Form.Item>
            <AddressInput form={form} />
            <Form.Item label="生日" name="birthday">
              <DatePicker format={'YYYY-MM-DD'} className="w-full" />
            </Form.Item>
            <Form.Item label="性別" name="gender">
              <Radio.Group options={['男', '女', '其他']} />
            </Form.Item>
            <Form.Item label="家庭成員">
              {family.map((member) => (
                <Button
                  key={member.id}
                  onClick={() =>
                    navigate(
                      `/setting/data_creation/believer_list/${member.id}`,
                    )
                  }
                  type="link"
                >
                  {member.name}
                </Button>
              ))}
            </Form.Item>
            <Form.Item className="col-span-full flex justify-center">
              <ExtendedButton
                onClick={handleSubmit}
                type="primary"
                htmlType="submit"
              >
                修改
              </ExtendedButton>
            </Form.Item>
          </Group>
          <Group groupTitle="訂單資料">
            <Tabs
              className="col-span-full"
              defaultActiveKey="1"
              items={items}
            />
          </Group>
        </Form>
      </MyCard>
    </Container>
  )
}

export default BelieverIdPage

type OrderType = GetArrType<
  GetArrType<
    TrpcOutputs['believer']['getBelieverDetailsById']['totalOrders']
  >['orders']
>

function ServiceTable({ orders }: { orders: OrderType[] }) {
  const columns: ColumnsType<OrderType> = [
    {
      title: '訂單編號',
      dataIndex: 'rank',
    },
    {
      title: '項目',
      dataIndex: 'serviceName',
    },
    {
      title: '位置',
      dataIndex: 'position',
    },
    {
      title: '價格',
      dataIndex: 'price',
    },
    {
      title: '日期',
      dataIndex: 'createdAt',
    },
  ]

  return (
    <Table
      bordered
      dataSource={orders.map((value, index) => ({
        ...value,
        key: index + 1,
      }))}
      columns={columns}
      pagination={false}
    />
  )
}
