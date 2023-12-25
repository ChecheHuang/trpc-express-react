import Group from '@/components/Group'
import FormTemplate from '@/components/form/FormTemplate'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs } from '@/types/trpc'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Input,
  Modal,
  Form,
  DatePicker,
  Cascader,
  Radio,
  InputRef,
  Button,
  Space,
  Checkbox,
  Select,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useRef } from 'react'

type CreateBelieverInputType = GetArrType<
  TrpcInputs['believer']['createBeliever']
>

type FamilyMemberType = Pick<
  CreateBelieverInputType,
  'name' | 'isParent' | 'birthday' | 'gender'
>

type FormDataType = Omit<
  CreateBelieverInputType,
  'birthday' | 'city' | 'area' | 'isParent'
> & {
  birthday: Dayjs
  cityAndArea: string[]
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
  const familyMembers = Form.useWatch('familyMembers', form)
  const { message } = useAntd()

  const addressInputRef = useRef<InputRef>(null)
  const { data: addressOptions } = trpcQuery.options.cityOptions.useQuery()
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
      const { familyMembers, cityAndArea, phone, address, ...values } =
        await form.validateFields()
      const [city, area] = cityAndArea
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
      console.log(error?.values)
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
        open={createModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleSubmit}>
            確定
          </Button>,
        ]}
        width={1200}
      >
        <FormTemplate
          form={form}
          initialValues={{
            name: '王曉明',
            gender: '男',
            birthday: dayjs(),
            phone: '0912345678',
            cityAndArea: ['台北市', '中正區'],
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
          <Group unstyled>
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: '請輸入姓名' }]}
            >
              <Input placeholder="請輸入姓名" />
            </Form.Item>

            <Form.Item
              label="性別"
              name="gender"
              rules={[{ required: true, message: '請選擇性別' }]}
            >
              <Radio.Group>
                <Radio value="男">男</Radio>
                <Radio value="女">女</Radio>
                <Radio value="其他">其他</Radio>
              </Radio.Group>
            </Form.Item>
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
            <Form.Item label="地址">
              <Form.Item name="cityAndArea" className="mb-2">
                <Cascader
                  placeholder="請選擇縣市"
                  onChange={(stringArray) => {
                    if (!stringArray) return
                    addressInputRef.current?.focus()
                    form.setFieldValue('address', '')
                  }}
                  options={addressOptions}
                />
              </Form.Item>
              <Form.Item
                name="address"
                rules={[{ required: true, message: '請輸入地址' }]}
              >
                <Input ref={addressInputRef} placeholder="請輸入地址" />
              </Form.Item>
            </Form.Item>
            <Form.Item
              label={
                <div>
                  家庭成員
                  <br />
                  (打勾選取為戶長)
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
                            checked={familyMembers?.[key]?.isParent}
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
                          className="mb-2 w-[110px]"
                          name={[name, 'name']}
                          rules={[{ required: true, message: '請輸入姓名' }]}
                        >
                          <Input placeholder="請輸入姓名" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          className="mb-2 w-[70px]"
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
                            className="w-[180px]"
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
          </Group>
        </FormTemplate>
      </Modal>
    </>
  )
}

export default CreateBelieverModel
