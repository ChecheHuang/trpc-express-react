import { DisplayDataType } from '../_api'
import { useAntd } from '@/provider/AntdProvider'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Form, Input, Table } from 'antd'
import type { FormInstance } from 'antd/es/form'
import React, { useContext, useEffect, useRef, useState } from 'react'

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface EditableRowProps {
  index: number
}

export const EditableRow: React.FC<EditableRowProps> = ({
  index,
  ...props
}) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  children: React.ReactNode
  dataIndex: keyof DisplayDataType
  record: DisplayDataType
  handleSave: (record: DisplayDataType) => void
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)!
  const { modal } = useAntd()

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const onSave = () => {
    modal?.confirm({
      title: <div>確認修改資料嗎</div>,
      icon: <ExclamationCircleOutlined />,
      content: '刪除資料不可回復，確認修改?',
      okText: '確認',
      cancelText: '取消',
      onOk: async () => {
        const values = await form.validateFields()
        toggleEdit()
        handleSave({ ...record, ...values })
      },
      onCancel: () => {
        toggleEdit()
      },
    })
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex as string}
        rules={[
          {
            required: true,
            message: `${title} 需要輸入`,
          },
        ]}
      >
        <Input ref={inputRef} onBlur={onSave} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

type EditableTableProps = Parameters<typeof Table>[0]
export type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>
