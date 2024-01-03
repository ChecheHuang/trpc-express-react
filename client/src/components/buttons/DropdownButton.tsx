import { Button, Dropdown } from 'antd'
import { v4 as uuid } from 'uuid'

interface DropdownButtonProps {
  children: React.ReactNode
  content?: React.ReactNode
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  content,
}) => {
  const items = [
    {
      key: uuid(),
      label: <div className="flex flex-col gap-1">{children}</div>,
    },
  ]
  return (
    <>
      <Dropdown menu={{ items }} placement="bottom">
        {content ? content : <Button>操作</Button>}
      </Dropdown>
    </>
  )
}

export default DropdownButton
