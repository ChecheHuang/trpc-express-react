import { trpcQuery } from '@/provider/TrpcProvider'
import { Cascader, Form, Input, InputRef } from 'antd'
import { FormInstance } from 'antd/lib'
import { useRef } from 'react'

type AddressInputProps = {
  form: FormInstance
}

const AddressInput = ({ form }: AddressInputProps) => {
  const { data: addressOptions } = trpcQuery.options.cityOptions.useQuery()
  const addressInputRef = useRef<InputRef>(null)

  return (
    <>
      <Form.Item label="地址">
        <Form.Item
          name="cityAndArea"
          className="mb-2"
          rules={[{ required: true, message: '請選擇縣市' }]}
        >
          <Cascader
            placeholder="請選擇縣市"
            onChange={(stringArray) => {
              if (!stringArray) return
              addressInputRef.current?.focus()
              form.setFieldValue('address', '')
            }}
            options={addressOptions}
          />
        </Form.Item>
        <Form.Item
          name="address"
          rules={[{ required: true, message: '請輸入地址' }]}
        >
          <Input ref={addressInputRef} placeholder="請輸入地址" />
        </Form.Item>
      </Form.Item>
    </>
  )
}

export default AddressInput
