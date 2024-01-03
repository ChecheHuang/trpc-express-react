import ExtendedButton from './ExtendedButton'
import { exportExcel } from '@/lib/utils'
import { FC, useState } from 'react'

interface DownloadButtonProps {
  data: AnyObject[]
  handleExport?: () => void
}

const DownloadButton: FC<DownloadButtonProps> = ({
  data = [],
  handleExport,
}) => {
  const [loading, setLoading] = useState<boolean>(false)

  function handleOnExport() {
    setLoading(true)
    exportExcel(data)
    setLoading(false)
  }

  const onClickHandler = handleExport ? handleExport : handleOnExport

  return (
    <>
      <ExtendedButton
        className="bg-green-800 hover:!bg-green-700"
        type="primary"
        onClick={onClickHandler}
        loading={loading}
      >
        下載Excel
      </ExtendedButton>
    </>
  )
}

export default DownloadButton
