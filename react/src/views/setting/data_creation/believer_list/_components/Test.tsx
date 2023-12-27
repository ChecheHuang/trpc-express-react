import ExtendedButton from '@/components/buttons/ExtendedButton'
import { useAntd } from '@/provider/AntdProvider'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Table,
} from 'antd'
import DropdownButton from 'antd/es/dropdown/dropdown-button'
import type { ColumnsType } from 'antd/es/table'
import { FormInstance } from 'antd/lib'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'

const Test = () => {
  const { modal } = useAntd()

  const [drawer, setDrawer] = useState({ personKey: '', open: false })
  const [serviceModal, setServiceModal] = useState({
    serviceName: '',
    open: false,
  })
  const serviceFormRef = useRef<FormInstance>(null)
  return (
    <>
      <Modal
        title={serviceModal.serviceName}
        open={serviceModal.open}
        onOk={() => {
          modal.confirm({
            title: '服務成功建立',
            icon: <ExclamationCircleOutlined />,
            content: '是否列印收據',
            okText: '確認',
            cancelText: '取消',
            onOk: () => {
              setServiceModal({ ...serviceModal, open: false })
            },
          })
        }}
        onCancel={() => {
          setServiceModal({ ...serviceModal, open: false })
        }}
        width={900}
        centered
      >
        {/* 這是服務介紹 */}
        <div className="p-4">
          <Form className="grid grid-cols-3  gap-x-3" ref={serviceFormRef}>
            <Form.Item initialValue="112" name="1" label="年度">
              <Input />
            </Form.Item>
            <Form.Item initialValue="2000" name="2" label="總金額">
              <Input disabled />
            </Form.Item>
            <Form.Item name="3" label="日期" initialValue={dayjs()}>
              <DatePicker format={'YYYY年MM月DD日'} className="w-full" />
            </Form.Item>
            <Form.Item className=" col-span-3" label="備註">
              <Input />
            </Form.Item>

            <Form.Item label="點燈電腦給號">
              <Checkbox checked />
            </Form.Item>
            <Form.Item label="拜斗電腦給號">
              <Checkbox checked />
            </Form.Item>
            <Form.Item label="其他電腦給號">
              <Checkbox checked />
            </Form.Item>
            <Form.Item name="00" initialValue={'王曉明'} label="經辦員">
              <Select
                options={[
                  { value: '王曉明', label: '王曉明' },
                  { value: '王大明', label: '王大明' },
                ]}
              />
            </Form.Item>
            {/* <Form.Item className="flex w-full  place-content-center">
              <ExtendedButton type="primary">收據列印</ExtendedButton>
            </Form.Item> */}
          </Form>
          <ServiceTable />
        </div>
      </Modal>
      <Drawer
        title="宮廟服務"
        placement="right"
        onClose={() => {
          setDrawer({ ...drawer, open: false })
        }}
        open={drawer.open}
      >
        <div className="grid w-full gap-2">
          {['信眾服務', '拜斗服務'].map((item) => {
            return (
              <ExtendedButton
                onClick={() => {
                  setDrawer({ ...drawer, open: false })
                  setServiceModal({ serviceName: item, open: true })
                }}
                type="primary"
                key={item}
              >
                {item}
              </ExtendedButton>
            )
          })}
        </div>
      </Drawer>
    </>
  )
}

export default Test

function ServiceTable() {
  const dataSource = [
    {
      name: '程智成',
    },
    {
      name: '程浩然',
    },
    {
      name: '程健柏',
    },
    {
      name: '程智輝',
    },
  ]

  const columns: ColumnsType<any> = [
    {
      title: '收據',
      render: (_, props) => {
        return <Checkbox />
      },
    },
    {
      title: '成員',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '點燈',
      render: (_, props) => {
        return <LightSelect title="點燈種類" />
      },
    },
    {
      title: '燈號',
      render: (_, props) => {
        return <>燈號</>
      },
    },
    {
      title: '太歲',
      render: (_, props) => {
        return <Checkbox />
      },
    },
    {
      title: '拜斗',
      render: (_, props) => {
        return <LightSelect title="拜斗種類" />
      },
    },
    {
      title: '斗號',
      render: (_, props) => {
        return <>斗號</>
      },
    },
    {
      title: '其他服務',
      render: (_, props) => {
        return (
          <DropdownButton>
            <ExtendedButton type="info">其他服務</ExtendedButton>
          </DropdownButton>
        )
      },
    },
  ]

  return (
    <Table
      bordered
      dataSource={dataSource.map((value, index) => ({
        ...value,
        key: index + 1,
      }))}
      columns={columns}
      pagination={false}
    />
  )
}

function LightSelect({ title }: { title: string }) {
  return (
    <Select
      placeholder={title}
      options={[
        {
          label: '光明燈',
          options: [
            { value: '光明燈A', label: '光明燈A' },
            { value: '光明燈B', label: '光明燈B' },
          ],
        },
        {
          label: '文昌燈',
          options: [
            { label: '文昌燈A', value: '文昌燈A' },
            { label: '文昌燈B', value: '文昌燈B' },
          ],
        },
        {
          label: '財神燈',
          options: [
            { label: '財神燈A', value: '財神燈A' },
            { label: '財神燈B', value: '財神燈B' },
          ],
        },
      ]}
    />
  )
}
