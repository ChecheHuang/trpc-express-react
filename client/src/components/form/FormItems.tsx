import { DatePicker, Form, Input, Radio, Select } from 'antd'
import { FormItemProps } from 'antd/lib/form'

import AddressInput from './AddressInput'

const FormItems = () => {
  return <></>
}

const Name = ({ rules, ...rest }: FormItemProps) => {
  return (
    <Form.Item
      label="姓名"
      name="name"
      rules={[{ required: true, message: '輸入姓名' }, ...(rules || [])]}
      {...rest}
    >
      <Input placeholder="請輸入姓名" autoFocus />
    </Form.Item>
  )
}

const Phone = ({ rules, ...rest }: FormItemProps) => {
  return (
    <Form.Item
      label="電話"
      name="phone"
      rules={[{ required: true, message: '輸入電話' }, ...(rules || [])]}
      {...rest}
    >
      <Input placeholder="輸入電話" />
    </Form.Item>
  )
}

const Birthday = ({ rules, ...rest }: FormItemProps) => {
  return (
    <Form.Item
      label="生日"
      name="birthday"
      rules={[{ required: true, message: '輸入生日' }, ...(rules || [])]}
      {...rest}
    >
      <DatePicker className="w-full" format={'YYYY-MM-DD'} />
    </Form.Item>
  )
}
const GenderRadio = ({ rules, ...rest }: FormItemProps) => {
  return (
    <Form.Item label="性別" name="gender">
      <Radio.Group options={['男', '女', '其他']} />
    </Form.Item>
  )
}
const GenderSelect = ({ rules, ...rest }: FormItemProps) => {
  return (
    <Form.Item
      label="性別"
      name="gender"
      rules={[{ required: true, message: '選擇性別' }, ...(rules || [])]}
      {...rest}
    >
      <Select
        options={[
          { value: '男', label: '男' },
          { value: '女', label: '女' },
          { value: '其他', label: '其他' },
        ]}
        placeholder="性別"
      />
    </Form.Item>
  )
}

FormItems.Name = Name
FormItems.Phone = Phone
FormItems.Birthday = Birthday
FormItems.GenderRadio = GenderRadio
FormItems.GenderSelect = GenderSelect
FormItems.Address = AddressInput

export default FormItems
