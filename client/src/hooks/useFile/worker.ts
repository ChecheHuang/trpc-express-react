import { readExcel } from '@/lib/utils'

/* eslint-disable no-restricted-globals */
self.onmessage = async function (event) {
  const { formatFn, file } = event.data
  const excelData = await readExcel(file)
  const result = formatFn ? eval(`(${formatFn})`)(excelData) : excelData

  self.postMessage(result)
}
