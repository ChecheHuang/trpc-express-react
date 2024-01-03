import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'

export const useTemple = () => {
  const { message } = useAntd()
  const {
    data = {
      name: '',
      phone: '',
      address: '',
      principal: '',
      wordsOfThanksForService: '',
      wordsOfThanksForDonation: '',
    },
    refetch,
  } = trpcQuery.temple.getTemple.useQuery()

  const { mutate: updateTemple } = trpcQuery.temple.updateTemple.useMutation({
    onSuccess: () => {
      refetch()
      message.success('更新成功')
    },
  })

  return { temple: data, updateTemple }
}
