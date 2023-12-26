import ExtendedButton from '@/components/buttons/ExtendedButton';
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { ExclamationCircleOutlined } from '@ant-design/icons';

const DeleteLightButton = ({ id, name }: { id: string; name: string }) => {
  const utils = trpcQuery.useUtils()
  const { message, modal } = useAntd()
  const { mutate: deleteLight } = trpcQuery.service.deleteLight.useMutation({
    onSuccess: () => {
      utils.service.getLights.invalidate()
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
            deleteLight(id)
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

export default DeleteLightButton
