import ExtendedButton from '@/components/buttons/ExtendedButton'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const DeleteButton = ({ id, name }: { id: string; name: string }) => {
  const utils = trpcQuery.useUtils()
  const { message, modal } = useAntd()
  const { mutate: deleteService } = trpcQuery.service.light.delete.useMutation({
    onSuccess: () => {
      utils.service.light.getAll.invalidate()
      message.success('刪除成功')
    },
  })
  return (
    <ExtendedButton
      onClick={() => {
        modal?.confirm({
          title: <div>{name}</div>,
          icon: <ExclamationCircleOutlined />,
          content: '刪除資料不可回復，確認刪除?',
          okText: '確認',
          cancelText: '取消',
          onOk: () => {
            deleteService(id)
          },
        })
      }}
      type="primary"
      danger
    >
      刪除
    </ExtendedButton>
  )
}

export default DeleteButton
