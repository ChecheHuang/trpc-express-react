import { Form, Input, FormItemProps } from 'antd'
import React, { Children, cloneElement, isValidElement, ReactNode } from 'react'

export type FormatType = FormItemProps & {
  content?: React.ReactNode
}

export type DynamicRule = Pick<FormItemProps<string>, 'name' | 'rules'> & {
  disabled?: boolean
}

export const createFormItemFormatFn =
  (dynamicRuleArray: DynamicRule[]) => (formItemArray: FormatType[]) => {
    const result = (
      <>
        {formItemArray?.map(
          ({ content: originContent = <Input />, name, ...rest }, index) => {
            return (
              <Form.Item key={index} name={name} {...rest}>
                {originContent}
              </Form.Item>
            )
          },
        )}
      </>
    )
    const content = findAllFormItems(result, dynamicRuleArray)
    return content
  }
function findAllFormItems(
  content: ReactNode,
  dynamicRuleArray: DynamicRule[],
): ReactNode {
  function findItems(children: ReactNode): ReactNode {
    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        if (child.type === Form.Item) {
          const formItemProps = child.props
          const matchingByName = dynamicRuleArray.find(
            (item) =>
              JSON.stringify(item.name) === JSON.stringify(formItemProps.name),
          )
          if (matchingByName) {
            const { children: element, ...restProps } = child.props
            const newFormItem = cloneElement(child, {
              rules: matchingByName.rules,
              ...restProps,
            })

            const updatedInput = cloneElement(element, {
              ...element?.props,
              ...(matchingByName?.disabled && {
                disabled: matchingByName?.disabled,
              }),
            })
            return cloneElement(newFormItem, {
              children: findItems(updatedInput),
            } as Partial<unknown>)
          }
        }

        if (child?.props?.children) {
          const updatedChildren = findItems(child.props.children)
          return cloneElement(child, {
            children: updatedChildren,
          } as Partial<unknown>)
        }
      }

      return child
    })
  }

  return findItems(content)
}
