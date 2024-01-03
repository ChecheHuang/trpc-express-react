import { Input, Form } from 'antd'

import ChangeSizeRadio from '@/components/ChangeSizeRadio'
import Group from '@/components/Group'
import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import PrevButton from '@/components/buttons/PrevButton'
import Container from '@/components/container/Container'
import AddressInput from '@/components/form/AddressInput'
import { useTemple } from '@/store/useTemple'
import { TrpcInputs } from '@/types/trpc'

type FormType = TrpcInputs['temple']['updateTemple']

const TempleSetting = () => {
  const [form] = Form.useForm<FormType>()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      updateTemple(values)
    } catch (error: any) {
      console.log(error)
      const firstName = error?.errorFields[0]?.name
      form.scrollToField(firstName)
      const fieldInput = document.getElementById(`${firstName}`)
      fieldInput && fieldInput.focus()
    }
  }

  const { temple, updateTemple } = useTemple()

  return (
    <>
      <Form form={form} labelCol={{ span: 6 }} initialValues={temple}>
        <Container>
          <MyCard>
            <div className=" flex items-center justify-between">
              <h1 className="text-3xl">宮廟設定</h1>
              <div className="flex gap-2">
                <PrevButton />
                <ChangeSizeRadio />
              </div>
            </div>
            <Group
              groupTitle="宮廟資料設定"
              id="first"
              aria-label="宮廟資料設定"
            >
              <Form.Item
                label="宮廟名稱"
                name="name"
                rules={[{ required: true, message: '請輸入宮廟名稱' }]}
              >
                <Input autoFocus />
              </Form.Item>
              <Form.Item
                label="電話"
                name="phone"
                rules={[{ required: true, message: '請輸入電話' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="負責人"
                name="principal"
                rules={[{ required: true, message: '請輸入負責人' }]}
              >
                <Input />
              </Form.Item>
              <AddressInput form={form} direction="col" />
            </Group>

            <Group groupTitle="參數設定" id="參數設定" aria-label="參數設定">
              <Form.Item label="服務感謝狀用詞" name="wordsOfThanksForService">
                <Input />
              </Form.Item>
              <Form.Item label="捐獻感謝狀用詞" name="wordsOfThanksForDonation">
                <Input />
              </Form.Item>
            </Group>
            <div className="flex justify-center">
              <ExtendedButton
                onClick={handleSubmit}
                type="primary"
                htmlType="submit"
              >
                修改
              </ExtendedButton>
            </div>
          </MyCard>
        </Container>
      </Form>
    </>
  )
}

export default TempleSetting
