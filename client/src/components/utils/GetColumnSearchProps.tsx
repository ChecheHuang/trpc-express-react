import ExtendedButton from '@/components/buttons/ExtendedButton'
import { useTheme } from '@/store/useTheme'
import { SearchOutlined } from '@ant-design/icons'
import { Input, InputRef } from 'antd'
import type { FilterDropdownProps } from 'antd/lib/table/interface'
import { useRef } from 'react'

export const GetColumnSearchProps = () => {
  const { colorPrimary } = useTheme()
  const inputRef = useRef<InputRef>(null)

  return {
    filterDropdown: (props: FilterDropdownProps) => {
      const { selectedKeys, setSelectedKeys, confirm, clearFilters } = props
      const handleReset = () => {
        clearFilters?.()
        confirm({ closeDropdown: true })
      }
      return (
        <div className="p-2">
          <Input
            ref={inputRef}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            value={selectedKeys[0]}
          />
          <div className="mt-2 flex justify-around gap-2">
            <ExtendedButton
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => confirm()}
            >
              搜尋
            </ExtendedButton>
            <ExtendedButton onClick={handleReset}>重置</ExtendedButton>
            <ExtendedButton
              danger
              onClick={() => confirm({ closeDropdown: true })}
            >
              取消
            </ExtendedButton>
          </div>
        </div>
      )
    },
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? colorPrimary : undefined }} />
    ),
  }
}
