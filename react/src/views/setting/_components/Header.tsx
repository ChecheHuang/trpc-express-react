import Breadcrumb from './Breadcrumb'
import ToggleThemeButton from '@/components/ToggleThemeButton'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/useUser'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, MenuProps, Tag } from 'antd'
import { Avatar } from 'antd'

interface HeaderProps {
  toggleCollapsed: () => void
  collapsed: boolean
  className?: string
}

const Header = ({ toggleCollapsed, collapsed, className }: HeaderProps) => {
  const name = useUserStore((state) => state.name)

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <ExtendedButton onClick={logout} type="info">
          登出
        </ExtendedButton>
      ),
    },
  ]
  return (
    <header
      className={cn(
        'flex  items-center justify-between bg-white px-3	text-dark shadow-slate-500 ',
        className,
      )}
    >
      <div className="flex gap-10">
        <Button size="small" onClick={toggleCollapsed}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <div>{name}</div>
        <ToggleThemeButton />
        <Dropdown menu={{ items }} placement="bottomLeft" arrow>
          <Avatar
            src="/images/avatar.webp"
            className="cursor-pointer"
            size={44}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </div>
    </header>
  )
}

export default Header
