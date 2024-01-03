import { useAntd } from '@/provider/AntdProvider'
import { useCallback, ChangeEvent, useState } from 'react'

export const useExcel = (formatFn?: (data: AnyObject[]) => any) => {
  const { message } = useAntd()
  const [data, setData] = useState<AnyObject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleReadExcel = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setIsLoading(true)
      if (e.target.files === null) return
      const file = e.target.files[0]
      const isExcelFile =
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      const isCSVFile = file.name.endsWith('.csv')
      if (!isExcelFile && !isCSVFile) {
        return message.error('請選擇 Excel 檔或 CSV 檔')
      }

      const worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      })
      worker.postMessage({
        file,
        formatFn: formatFn ? formatFn.toString() : undefined,
      })
      worker.onmessage = ({ data }) => {
        setData(data)
        setIsLoading(false)
      }
      worker.onerror = function (event) {
        console.error(event.filename, event.lineno, event.message)
        setIsLoading(false)
      }
      e.target.value = ''
    },
    [formatFn, message],
  )

  return { handleReadExcel, data, isLoading }
}
