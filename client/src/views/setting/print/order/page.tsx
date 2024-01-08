import type { TableColumnsType } from 'antd'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'

import MyCard from '@/components/MyCard'
import Container from '@/components/container/Container'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcOutputs } from '@/types/trpc'

type PrintDataType = GetArrType<TrpcOutputs['order']['getPrints']>
type OrderDataType = GetArrType<PrintDataType['orders']>

const OrderPage = () => {
  const { data: queryData = [] } = trpcQuery.order.getPrints.useQuery()

  const columns: ColumnsType<PrintDataType> = [
    // { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '排序', dataIndex: 'rank', key: 'rank' },
    { title: '總金額', dataIndex: 'totalPrice', key: 'totalPrice' },
    {
      title: '創建時間',
      dataIndex: 'createdAt',
      render: (_, { createdAt }) => new Date(createdAt).toLocaleString(),
    },
  ]

  return (
    <Container>
      <MyCard>
        <Table
          size="small"
          columns={columns}
          expandable={{
            expandedRowRender: ({ orders }) => {
              const expandedColumns: TableColumnsType<OrderDataType> = [
                {
                  title: '信眾',
                  render: (_, order) => {
                    return <div>{order.believer.name}</div>
                  },
                },
                { title: '年分', dataIndex: 'year' },
                {
                  title: '種類',
                  render: (_, order) => {
                    return <div>{order.serviceItem.service.category}</div>
                  },
                },
                {
                  title: '項目',
                  render: (_, order) => {
                    return <div>{order.serviceItem.name}</div>
                  },
                },
                {
                  title: '位置',
                  render: (_, order) => {
                    return <div>{order.position}</div>
                  },
                },
                {
                  title: '價格',
                  dataIndex: 'price',
                },
              ]
              return (
                <Table
                  size="small"
                  columns={expandedColumns}
                  dataSource={orders}
                  pagination={false}
                />
              )
            },
            defaultExpandedRowKeys: ['0'],
          }}
          dataSource={queryData}
        />
      </MyCard>
    </Container>
  )
}

export default OrderPage
