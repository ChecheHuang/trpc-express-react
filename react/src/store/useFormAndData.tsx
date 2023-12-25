import { Input, FormInstance } from 'antd'
import type { InputProps } from 'antd'
import React from 'react'
import { create } from 'zustand'

type FormAndDataStore<T> = {
  form: FormInstance
  setForm: (form: FormInstance) => void
  data: T
  setData: (data: T, roles?: string[]) => void
}
export const useFormAndData = create<FormAndDataStore<any>>((set) => ({
  form: {} as FormInstance,
  data: {},
  setForm: (form) => set({ form }),
  setData: (data) => set({ data }),
}))

export function NumberInput({
  onChange,
  name,
  ...rest
}: Override<
  InputProps,
  { name: string | string[]; onChange?: (value: string) => void }
>) {
  const { form } = useFormAndData()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    const reg = /^\d+(\.\d*)?$/
    if (reg.test(inputValue) || inputValue === '') {
      form.setFieldValue(name, inputValue)
      if (onChange) onChange(inputValue)
    }
  }

  return (
    <Input
      {...rest}
      value={form?.getFieldValue(name) || ''}
      onChange={handleChange}
    />
  )
}
