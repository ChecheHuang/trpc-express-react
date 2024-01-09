import type { TableColumnsType } from 'antd'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'

import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import Container from '@/components/container/Container'
import { usePrintModalStore } from '@/components/modals/PrintModal'
import { trpcQuery, TrpcOutputs } from '@/provider/TrpcProvider'

type PrintDataType = GetArrType<TrpcOutputs['order']['getPrints']>
type OrderDataType = GetArrType<PrintDataType['orders']>

const OrderPage = () => {
  const { data: queryData = [] } = trpcQuery.order.getPrints.useQuery()
  const printModal = usePrintModalStore()

  const columns: ColumnsType<PrintDataType> = [
    // { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '排序', dataIndex: 'rank', key: 'rank' },
    { title: '年分', dataIndex: 'year', key: 'year' },
    { title: '服務成員', dataIndex: 'names', key: 'names' },
    { title: '種類', dataIndex: 'category', key: 'category' },
    { title: '總金額', dataIndex: 'totalPrice', key: 'totalPrice' },
    {
      title: '創建時間',
      dataIndex: 'createdAt',
      render: (_, { createdAt }) => new Date(createdAt).toLocaleString(),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <ExtendedButton
            type="primary"
            onClick={() => {
              printModal.onOpen(record.id)
            }}
          >
            列印
          </ExtendedButton>
        )
      },
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
