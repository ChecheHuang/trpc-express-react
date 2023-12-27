import FormTemplate from '@/components/form/FormTemplate'
import NumberInput from '@/components/form/NumberInput'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs } from '@/types/trpc'
import { Button, Form, Input, Modal } from 'antd'

const CreateLightDetailModal = ({
  lightId,
  open,
  onClose,
}: {
  lightId: string
  open: boolean
  onClose: () => void
}) => {
  const { message } = useAntd()
  const utils = trpcQuery.useUtils()
  const { mutate: createLightDetail, isLoading: isCreateLight } =
    trpcQuery.service.createLightDetail.useMutation({
      onSuccess: () => {
        message.success('新增成功')
        utils.service.getLights.invalidate()
        addForm.resetFields()
        onClose()
      },
    })
  const [addForm] = Form.useForm<TrpcInputs['service']['createLightDetail']>()

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields()
      const { start, end } = values
      if (start > end) {
        message.error('開始不可大於結束')
        return
      }
      createLightDetail(values)
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
      <FormTemplate form={addForm}>
        <Form.Item
          initialValue={lightId}
          className="hidden"
          name="serviceItemId"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label="燈座名稱"
          rules={[{ required: true, message: '請輸入燈座名稱' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="start"
          label="開始"
          initialValue={1}
          rules={[{ required: true, message: '請輸入開始' }]}
        >
          <NumberInput name="start" form={addForm} />
        </Form.Item>
        <Form.Item
          name="end"
          label="結束"
          initialValue={999}
          rules={[{ required: true, message: '請輸入結束' }]}
        >
          <NumberInput name="end" form={addForm} />
        </Form.Item>
      </FormTemplate>
    </Modal>
  )
}

export default CreateLightDetailModal