import addressOptions from './addressOptions.json'
import { cn } from '@/lib/utils'
import { Cascader, Form, Input, InputRef } from 'antd'
import { FormInstance } from 'antd/lib'
import { useRef } from 'react'

type AddressInputProps = {
  className?: string
  form: FormInstance
}

const AddressInput = ({ form, className }: AddressInputProps) => {
  // const { data: addressOptions } = trpcQuery.options.cityOptions.useQuery()
  const addressInputRef = useRef<InputRef>(null)
  const customValue = Form.useWatch((values) => {
    if (!values.city || !values.area) return undefined
    return [values.city, values.area]
  }, form)
  return (
    <>
      <Form.Item label="地址" className={cn('required', className)}>
        <div className="flex">
          <Form.Item
            className="mb-2"
            rules={[{ required: true, message: '請選擇縣市' }]}
          >
            <Cascader
              allowClear={false}
              value={customValue}
              placeholder="請選擇縣市"
              onChange={(stringArray) => {
                if (!stringArray) return
                const [city, area] = stringArray
                form.setFieldValue('city', city)
                form.setFieldValue('area', area)
                addressInputRef.current?.focus()
                // form.setFieldValue('address', '')
              }}
              options={addressOptions}
            />
          </Form.Item>
          <Form.Item
            className="mb-0 ml-2 flex-1"
            name="address"
            rules={[{ required: true, message: '請輸入地址' }]}
          >
            <Input ref={addressInputRef} placeholder="請輸入地址" />
          </Form.Item>
        </div>
        <Form.Item name="city" className="hidden">
          <Input />
        </Form.Item>
        <Form.Item name="area" className="hidden">
          <Input />
        </Form.Item>
      </Form.Item>
    </>
  )
}

export default AddressInput
