import type { TabsProps } from 'antd'
import { Button, Form, Tabs } from 'antd'
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
import FormItems from '@/components/form/FormItems'
import { useAntd } from '@/provider/AntdProvider'
import { TrpcOutputs, trpcClient, trpcQuery } from '@/provider/TrpcProvider'
import { SizeType, useTheme } from '@/store/useTheme'

type DataType = TrpcOutputs['believer']['getBelieverDetailsById']

type FormType = Prettify<Override<DataType, { birthday: Dayjs }>>

const BelieverIdPage = () => {
  const id = useParams().believerId as string
  const [form] = Form.useForm<FormType>()
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
      parent: {
        id: '',
        name: '',
      },
    },
    isFetching,
  } = trpcQuery.believer.getBelieverDetailsById.useQuery(id)
  const { totalOrders, birthday, family, parent, ...rest } = data
  const formData = useMemo(
    () => ({
      ...rest,
      birthday: dayjs(birthday),
    }),
    [rest, birthday],
  )

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
  useEffect(() => {
    form.setFieldsValue(formData)
  }, [formData, form])

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
            <FormItems.Name />
            <FormItems.Phone />
            <FormItems.Birthday />
            <FormItems.GenderRadio />
            <FormItems.Address form={form} direction="col" />
            <Form.Item
              label={
                <div>
                  家庭成員
                  <br />
                  戶長({parent.name})
                </div>
              }
            >
              {family.map((member) => (
                <Button
                  key={member.id}
                  onClick={() => {
                    navigate(
                      `/setting/data_creation/believer_list/${member.id}`,
                    )
                  }}
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
          <Group groupTitle="服務紀錄">
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
      title: '服務編號',
      dataIndex: 'rank',
    },
    {
      title: '服務種類',
      dataIndex: 'category',
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
