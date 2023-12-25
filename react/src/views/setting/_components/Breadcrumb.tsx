import { useRouter } from '@/hooks/useRouter'
import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb as AntdBreadcrumb } from 'antd'
import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const Breadcrumb: React.FC = () => {
  const { extraBreadcrumb } = useRouter()

  const items = [
    { url: '/setting', name: <HomeOutlined /> },
    ...extraBreadcrumb.filter((_, index) => index !== 0),
  ].map(({ url, name }) => ({
    key: url,
    title: (
      <Link to={url}>
        <span>{name}</span>
      </Link>
    ),
  }))

  return <AntdBreadcrumb items={items} />
}
export default memo(Breadcrumb)
