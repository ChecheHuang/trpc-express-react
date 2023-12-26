import NumberInput from '@/components/form/NumberInput'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs } from '@/types/trpc'
import { Button, Form, Input, Modal } from 'antd'

const CreateLightModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const { message } = useAntd()
  const utils = trpcQuery.useUtils()
  const { mutate: createLight, isLoading: isCreateLight } =
    trpcQuery.service.createLight.useMutation({
      onSuccess: () => {
        message.success('新增成功')
        utils.service.getLights.invalidate()
        addForm.resetFields()
        onClose()
      },
    })
  const [addForm] = Form.useForm<TrpcInputs['service']['createLight']>()

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields()
      createLight(values)
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
          disabled={isCreateLight}
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

export default CreateLightModal
