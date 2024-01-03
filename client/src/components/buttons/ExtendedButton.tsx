import { Button, ButtonProps } from 'antd'

const antdTypes = ['primary', 'dashed', 'link', 'text', 'default'] as const
const myTypes = ['info', 'warning', 'success'] as const

const myTypesClass = new Map<(typeof myTypes)[number], string>([
  [
    'info',
    'bg-orange-400 text-white hover:!bg-orange-300 hover:!text-white hover:!border-transparent',
  ],
  [
    'success',
    'bg-green-600 text-white hover:!bg-green-600/80 hover:!text-white hover:!border-transparent',
  ],
  ['warning', ''],
])

export type ExtendedButtonProps = Omit<ButtonProps, 'type'> & {
  type?: (typeof antdTypes)[number] | (typeof myTypes)[number]
}

const ExtendedButton: React.FC<ExtendedButtonProps> = ({
  type = 'default',
  ...rest
}) => {
  if (isAntdType(type)) {
    return <Button type={type} {...rest} />
  }
  return <Button className={myTypesClass.get(type)} {...rest} />
}

export default ExtendedButton

function isAntdType(
  type: ExtendedButtonProps['type']
): type is (typeof antdTypes)[number] {
  return antdTypes.includes(type as (typeof antdTypes)[number])
}
