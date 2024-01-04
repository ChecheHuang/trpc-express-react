import { Button, Form, Input, Modal } from 'antd'

import NumberInput from '@/components/form/NumberInput'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs } from '@/types/trpc'

const CreateModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const { message } = useAntd()
  const utils = trpcQuery.useUtils()
  const { mutate: create, isLoading: isCreating } =
    trpcQuery.service.light.create.useMutation({
      onSuccess: () => {
        message.success('新增成功')
        utils.service.light.getAll.invalidate()
        addForm.resetFields()
        onClose()
      },
    })
  const [addForm] = Form.useForm<TrpcInputs['service']['light']['create']>()

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields()
      create(values)
    } catch (error: any) {
      const firstName = error?.errorFields[0]?.name
      addForm.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }
  const handleCancel = () => {
    addForm.resetFields()
    onClose()
  }

  return (
    <Modal
      title="新增燈別"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={() => onClose()}>
          取消
        </Button>,
        <Button
          disabled={isCreating}
          key="ok"
          type="primary"
          onClick={handleAdd}
        >
          確定
        </Button>,
      ]}
      width={400}
    >
      <Form form={addForm}>
        <Form.Item
          name="name"
          label="燈別"
          rules={[{ required: true, message: '請輸入燈別' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="price"
          label="價格"
          rules={[{ required: true, message: '請輸入價格' }]}
        >
          <NumberInput name="price" form={addForm} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateModal
