import { cn } from '@/lib/utils'
import { Form, Input, Radio } from 'antd'
import { FormInstance, InputRef } from 'antd/lib'
import { useEffect, useRef, useState } from 'react'

type CustomRadioProps = {
  form: FormInstance
  name: string
  label: string
  options: string[]
  required: boolean
}

const CustomRadio = ({
  form,
  name,
  label,
  options,
  required,
}: CustomRadioProps) => {
  const radioValue = Form.useWatch(name, form) || ''
  console.log(radioValue)
  const [otherInputValue, setOtherInputValue] = useState<string>('')

  const otherInputRef = useRef<InputRef>(null)
  const lastLabel = options.slice(-1)[0]
  const lastElement = {
    label: lastLabel,
    value: otherInputValue,
  }
  const remainingElements = options.slice(0, -1)
  const isInputDisabled = remainingElements.includes(radioValue)
  useEffect(() => {
    if (isInputDisabled) return
    if (radioValue === otherInputValue) return
    setOtherInputValue(radioValue)
  }, [radioValue, isInputDisabled, otherInputValue])
  //   useEffect(() => {
  //     if (otherInputValue === radioValue) {
  //       otherInputRef.current?.focus()
  //     }
  //   }, [radioValue, otherInputValue])

  return (
    <>
      <Form.Item label={label} className={cn(' mb-0 ', required && 'required')}>
        <div className="flex flex-col flex-nowrap md:flex-row ">
          <Form.Item
            name={name}
            rules={
              required
                ? [
                    {
                      required: true,
                      message: isInputDisabled
                        ? `請選擇${label}`
                        : `輸入${lastLabel}`,
                    },
                  ]
                : []
            }
          >
            <Radio.Group options={[...remainingElements, lastElement]} />
          </Form.Item>
          <Form.Item className="flex-1">
            <Input
              ref={otherInputRef}
              disabled={isInputDisabled}
              value={otherInputValue}
              onFocus={() => form.setFieldValue(name, otherInputValue)}
              onChange={(e) => {
                setOtherInputValue(e.target.value)
                form.setFieldValue(name, e.target.value)
              }}
            />
          </Form.Item>
        </div>
      </Form.Item>
    </>
  )
}

export default CustomRadio
