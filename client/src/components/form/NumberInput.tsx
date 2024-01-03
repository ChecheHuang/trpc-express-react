import { Input, InputProps } from 'antd'
import { FormInstance } from 'antd/lib'

type NumberInputProps = Override<
  InputProps,
  {
    name: string | string[]
    form: FormInstance
    onChange?: (value: number) => void
  }
>

function NumberInput({ onChange, name, form, ...rest }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    const reg = /^\d+(\.\d*)?$/
    if (inputValue === '') {
      form.setFieldValue(name, 0)
      if (onChange) onChange(0)
    }
    if (reg.test(inputValue)) {
      const number = parseInt(inputValue)
      form.setFieldValue(name, number)
      if (onChange) onChange(number)
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

export default NumberInput
