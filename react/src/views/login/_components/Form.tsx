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
        <Form.Item name="name" initialValue="我是superadmin">
          <Select
            options={[
              {
                label: '我是superadmin',
                value: '我是superadmin',
              },
              {
                label: '我是admin',
                value: '我是admin',
              },
              {
                label: '我是user',
                value: '我是user',
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
