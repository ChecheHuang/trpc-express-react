import { storage } from '@/lib/storage'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { CrownOutlined } from '@ant-design/icons'
import { Button, Form, Input, Select } from 'antd'
import { useNavigate } from 'react-router-dom'

const LoginForm = () => {
  const navigate = useNavigate()
  const { message } = useAntd()
  const { mutate: login, isLoading } = trpcQuery.auth.login.useMutation({
    onSuccess: (jwt) => {
      storage.set('jwt', jwt)
      message.success('登入成功')
      // navigate('/setting')
      window.location.reload()
    },
  })

  const onFinish = async (values: { name: string; password: string }) => {
    login(values)
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }
  return (
    <div>
      <Form
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item name="name" initialValue="我是超級管理員">
          <Select
            options={[
              {
                label: '我是超級管理員',
                value: '我是超級管理員',
              },
              {
                label: '我是管理員',
                value: '我是管理員',
              },
              {
                label: '我是一般使用者',
                value: '我是一般使用者',
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="password"
          initialValue="password"
          rules={[{ required: true, message: '輸入密碼' }]}
        >
          <Input.Password
            autoComplete="current-password"
            prefix={<CrownOutlined />}
            placeholder="密碼"
          />
        </Form.Item>
        <Form.Item>
          <Button loading={isLoading} block type="primary" htmlType="submit">
            登入
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm
