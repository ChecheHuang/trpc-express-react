import AddressInput from '@/components/form/AddressInput'
import CustomRadioGroup from '@/components/form/CustomRadioGroup'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs } from '@/types/trpc'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'

type CreateBelieverInputType = GetArrType<
  TrpcInputs['believer']['createBeliever']
>

type FamilyMemberType = Pick<
  CreateBelieverInputType,
  'name' | 'isParent' | 'birthday' | 'gender'
>

type FormDataType = Omit<CreateBelieverInputType, 'birthday' | 'isParent'> & {
  birthday: Dayjs
  familyMembers: FamilyMemberType[]
}

type CreateBelieverModelProps = {
  createModalOpen: boolean
  setCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CreateBelieverModel = ({
  createModalOpen,
  setCreateModalOpen,
}: CreateBelieverModelProps) => {
  const [form] = Form.useForm<FormDataType>()
  const watchFamilyMembers = Form.useWatch('familyMembers', form)
  const { message } = useAntd()

  const utils = trpcQuery.useUtils()
  const { mutate: createBeliever, isLoading: createBelieverLoading } =
    trpcQuery.believer.createBeliever.useMutation({
      onSuccess: () => {
        utils.believer.getBelievers.invalidate()
        utils.believer.getBelieversByFamily.invalidate()
        handleCancel()
        message.success('新增成功')
      },
    })

  const handleSubmit = async () => {
    try {
      const validateValues = await form.validateFields()

      const { familyMembers, phone, city, area, address, ...values } =
        validateValues
      const isParent = !familyMembers.some(
        (familyMember) => familyMember.isParent,
      )
      const current = { isParent, ...values }
      const submitData = [current, ...familyMembers].map(
        ({ birthday, ...believer }) => {
          return {
            ...believer,
            birthday: dayjs(birthday).format('YYYY-MM-DD HH:mm:ss'),
            city,
            area,
            phone,
            address,
          }
        },
      )
      createBeliever(submitData)
    } catch (error: any) {
      // console.log(error?.values)
    }
  }
  const handleCancel = () => {
    form.resetFields()
    setCreateModalOpen(false)
  }

  return (
    <>
      <Modal
        title="新增信眾"
        onCancel={handleCancel}
        open={createModalOpen}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            loading={createBelieverLoading}
            key="ok"
            type="primary"
            onClick={handleSubmit}
          >
            確定
          </Button>,
        ]}
        width={1200}
      >
        <Form
          labelCol={{ flex: '110px' }}
          form={form}
          initialValues={{
            name: '王曉明',
            birthday: dayjs(),
            phone: '0912345678',
            checkbox: ['蘋果', '自己想吃的水果'],
            gender: '不明',
            city: '台北市',
            area: '中正區',
            address: '忠孝東路',
            familyMembers: [
              {
                isParent: true,
                name: '王曉明爸爸',
                gender: '男',
                birthday: dayjs(),
              },
              {
                isParent: false,
                name: '王曉明妹妹',
                gender: '女',
                birthday: dayjs(),
              },
            ],
          }}
        >
          <div className="grid grid-cols-1 gap-x-3 md:grid-cols-2">
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: '請輸入姓名' }]}
            >
              <Input placeholder="請輸入姓名" />
            </Form.Item>

            <CustomRadioGroup
              form={form}
              name="gender"
              label="性別"
              options={['男', '女', '其他']}
              required
            />

            <Form.Item
              label="生日"
              name="birthday"
              rules={[{ required: true, message: '請選擇生日' }]}
            >
              <DatePicker
                format={'YYYY-MM-DD HH:mm:ss'}
                className="w-full"
                showTime
              />
            </Form.Item>
            <Form.Item label="電話" name="phone">
              <Input />
            </Form.Item>
            <AddressInput form={form} />

            <Form.Item
              label={
                <div>
                  家庭成員
                  <br />
                  (勾選為戶長)
                </div>
              }
            >
              <Form.List name="familyMembers">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} align="baseline">
                        <Form.Item
                          {...restField}
                          className="mb-2"
                          name={[name, 'isParent']}
                          // initialValue={false}
                        >
                          <Checkbox
                            checked={watchFamilyMembers?.[key]?.isParent}
                            onChange={(e) => {
                              const originFamilyMembers = form.getFieldValue(
                                'familyMembers',
                              ) as FamilyMemberType[]
                              form.setFieldValue(
                                'familyMembers',
                                originFamilyMembers.map(
                                  (familyMember, index) => ({
                                    ...familyMember,
                                    isParent:
                                      key === index ? e.target.checked : false,
                                  }),
                                ),
                              )
                            }}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          className="mb-2 "
                          name={[name, 'name']}
                          rules={[{ required: true, message: '請輸入姓名' }]}
                        >
                          <Input placeholder="請輸入姓名" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          className="mb-2 md:w-[70px]"
                          name={[name, 'gender']}
                          rules={[{ required: true, message: '請選擇性別' }]}
                        >
                          <Select
                            options={[
                              { value: '男', label: '男' },
                              { value: '女', label: '女' },
                              { value: '其他', label: '其他' },
                            ]}
                            placeholder="性別"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          className="mb-2"
                          name={[name, 'birthday']}
                          rules={[{ required: true, message: '請選擇生日' }]}
                        >
                          <DatePicker
                            placeholder="請選擇生日"
                            format={'YYYY-MM-DD HH:mm:ss'}
                            className="md:w-[180px]"
                            showTime
                          />
                        </Form.Item>
                        <CloseOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        新增
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default CreateBelieverModel
