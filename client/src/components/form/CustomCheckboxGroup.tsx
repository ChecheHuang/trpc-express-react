import { cn } from '@/lib/utils'
import { Checkbox, Form, Input } from 'antd'
import { FormInstance, InputRef } from 'antd/lib'
import { useEffect, useRef, useState } from 'react'

type CustomCheckboxGroupProps = {
  form: FormInstance
  name: string
  label: string
  options: string[]
  required?: boolean
}

const SLICE_INDEX = -1

const CustomCheckboxGroup = ({
  form,
  name,
  label,
  options,
  required,
}: CustomCheckboxGroupProps) => {
  const checkboxGroupValue: string[] = Form.useWatch(name, form) || []
  const [showInputValue, setShowInputValue] = useState<string>('')
  const [otherInputValue, setOtherInputValue] = useState<string>('')
  const otherInputRef = useRef<InputRef>(null)

  const lastLabel = options.slice(SLICE_INDEX)[0]
  const lastElement = {
    label: lastLabel,
    value: otherInputValue,
  }
  const remainingElements = options.slice(0, SLICE_INDEX)

  const result =
    checkboxGroupValue.filter(
      (element) => !remainingElements.includes(element),
    )[0] || ''

  useEffect(() => {
    if (result === otherInputValue) return
    setOtherInputValue(result)
    setShowInputValue(result)
  }, [result, otherInputValue])

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
                      message: `請選擇${label}`,
                    },
                  ]
                : []
            }
          >
            <Checkbox.Group
              onChange={(values) => {
                if (values[values.length - 1] === otherInputValue) {
                  otherInputRef.current?.focus()
                }
                form.setFieldValue(name, values)
              }}
              options={[...remainingElements, lastElement]}
            />
          </Form.Item>
          <Form.Item className="flex-1">
            <Input
              value={showInputValue}
              onChange={(e) => setShowInputValue(e.target.value)}
              ref={otherInputRef}
              onFocus={(e) => {
                const newValue = e.target.value
                if (
                  checkboxGroupValue[checkboxGroupValue.length - 1] !==
                  otherInputValue
                ) {
                  setOtherInputValue(newValue)
                  form.setFieldValue(name, [...checkboxGroupValue, newValue])
                  return
                }

                setOtherInputValue(newValue)
                form.setFieldValue(name, [
                  ...checkboxGroupValue.slice(0, SLICE_INDEX),
                  newValue,
                ])
              }}
              onBlur={(e) => {
                const newValue = e.target.value
                const prefixArray = checkboxGroupValue.slice(0, SLICE_INDEX)
                if (!newValue) {
                  setOtherInputValue(newValue)
                  form.setFieldValue(name, prefixArray)
                  return
                }
                setOtherInputValue(newValue)
                form.setFieldValue(name, [...prefixArray, newValue])
              }}
            />
          </Form.Item>
        </div>
      </Form.Item>
    </>
  )
}

export default CustomCheckboxGroup
