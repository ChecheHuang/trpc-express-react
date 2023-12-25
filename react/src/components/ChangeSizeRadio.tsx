import { SizeType, useTheme } from '@/store/useTheme'
import { Radio } from 'antd'

const ChangeSizeRadio = () => {
  const { size, changeSize } = useTheme()

  return (
    <Radio.Group
      defaultValue={size}
      onChange={(e) => {
        changeSize(e.target.value)
      }}
    >
      <Radio.Button value={SizeType.small}>小</Radio.Button>
      <Radio.Button value={SizeType.middle}>預設</Radio.Button>
      <Radio.Button value={SizeType.large}>大</Radio.Button>
    </Radio.Group>
  )
}

export default ChangeSizeRadio
