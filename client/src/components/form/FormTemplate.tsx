import { SizeType, useTheme } from '@/store/useTheme'
import { Form, FormProps, FormInstance } from 'antd'
import React, { forwardRef, ForwardRefRenderFunction, Ref } from 'react'

interface TemplateFormProps extends FormProps {
  children: React.ReactNode
  size?: SizeType
}

const FormTemplate: ForwardRefRenderFunction<
  FormInstance<any>,
  TemplateFormProps
> = ({ children, size, ...rest }, ref: Ref<FormInstance<any>>) => {
  const { size: zustandSize } = useTheme()

  const formSize = size ? size : zustandSize

  return (
    <Form
      ref={ref}
      labelWrap
      labelCol={{ span: formSize !== SizeType.small ? 6 : 12 }}
      layout={formSize !== SizeType.small ? 'horizontal' : 'vertical'}
      initialValues={{ formSize }}
      size={formSize}
      {...rest}
    >
      {children}
    </Form>
  )
}

export default forwardRef(FormTemplate)
