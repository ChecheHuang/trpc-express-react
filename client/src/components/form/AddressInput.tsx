import { Cascader, Form, AutoComplete } from 'antd'
import { FormInstance } from 'antd/lib'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useUpdateEffect } from '@/hooks/useHook'
import { cn } from '@/lib/utils'
import { trpcQuery } from '@/provider/TrpcProvider'

type AddressInputProps = {
  className?: string
  form: FormInstance
  name?: string
  label?: string | boolean
  direction?: 'row' | 'col'
}

const AddressInput = ({
  form,
  name = 'address',
  label = '地址',
  className,
  direction = 'row',
}: AddressInputProps) => {
  const [isInitSetUp, setIsInitSetUp] = useState(false)

  const [addressDetail, setAddressDetail] = useState('')
  const [cityAndArea, setCityAndArea] = useState<(string | number)[]>([])

  const addressInputRef = useRef(null)

  const { data: citys = {} } = trpcQuery.options.cityOptions.useQuery()

  const cascaderOptions = useMemo(() => {
    if (!citys) return []
    return Object.entries(citys).map(([key, value]) => ({
      value: key,
      label: key,
      children: Object.entries(value as AnyObject).map(([key]) => ({
        value: key,
        label: key,
      })),
    }))
  }, [citys])

  const formValue: string = form.getFieldValue(name) || ''
  useEffect(() => {
    if (isInitSetUp) return
    const [city, district, address] = formValue.split(/(?<=市|縣|區|鎮|鄉)/)
    setCityAndArea(city ? [city, district] : [])
    setAddressDetail(address || '')
  }, [formValue, isInitSetUp])

  useUpdateEffect(() => {
    const addressPrefix = cityAndArea.join('')
    const address = addressPrefix + addressDetail
    form.setFieldValue(name, address)
    setIsInitSetUp(true)
  }, [cityAndArea, addressDetail])

  const autoCompleteOptions = useMemo(() => {
    const [city, district] = cityAndArea
    if (!city || !district) return []
    const ignoreTypeCitys = citys as any
    const options: string[] = ignoreTypeCitys[city]?.[district] || []
    return options
      .filter((value) => value.includes(addressDetail))
      .map((value) => ({ value }))
  }, [cityAndArea, addressDetail, citys])

  return (
    <>
      <Form.Item
        rules={[
          { required: true, message: '請選擇縣市' },
          {
            pattern: /^(?!.*[區鄉鎮]$)/,
            message: '請輸入完整地址',
          },
        ]}
        name={name}
        label={label}
        className={cn('required ', className)}
      >
        <div
          className={cn('gap flex gap-2', direction === 'col' && 'flex-col')}
        >
          <Form.Item className="mb-0">
            <Cascader
              allowClear={false}
              value={cityAndArea}
              placeholder="請選擇縣市"
              onChange={(stringArray) => {
                if (!stringArray) return
                setCityAndArea(stringArray)
                setAddressDetail('')
                if (!addressInputRef.current)
                  return // eslint-disable-next-line no-extra-semi
                ;(addressInputRef.current as HTMLInputElement).focus()
              }}
              options={cascaderOptions}
            />
          </Form.Item>
          <Form.Item
            className="mb-0 flex-1"
            rules={[{ required: true, message: '請輸入地址' }]}
          >
            <AutoComplete
              ref={addressInputRef}
              value={addressDetail}
              onChange={(value) => {
                setAddressDetail(value)
              }}
              options={autoCompleteOptions}
              placeholder="請輸入地址"
            />
          </Form.Item>
        </div>
      </Form.Item>
    </>
  )
}

export default AddressInput
