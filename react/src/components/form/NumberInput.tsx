import { Input, InputProps } from 'antd'
import { FormInstance } from 'antd/lib'

type NumberInputProps = Override<
  InputProps,
  {
    name: string | string[]
    form: FormInstance
    onChange?: (value: string) => void
  }
>

function NumberInput({ onChange, name, form, ...rest }: NumberInputProps) {
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

export default NumberInput
