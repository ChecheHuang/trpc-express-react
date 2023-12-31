import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { TableProps } from 'antd/lib/table/InternalTable'
import type { SorterResult } from 'antd/lib/table/interface'
import chroma from 'chroma-js'
import dayjs from 'dayjs'
import lunisolar from 'lunisolar'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import DropdownButton from '@/components/buttons/DropdownButton'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import { useServiceModalStore } from '@/components/modals/ServiceModal'
import { GetColumnSearchProps } from '@/components/utils/GetColumnSearchProps'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery,TrpcInputs, TrpcOutputs } from '@/provider/TrpcProvider'
import { useTheme } from '@/store/useTheme'

type DataType = GetArrType<TrpcOutputs['believer']['getBelievers']['data']>
type QueryDataType = TrpcInputs['believer']['getBelievers']

const initQueryData: QueryDataType = {
  _page: '1',
  _limit: '10',
  orderKey: 'rank',
  orderValue: 'desc',
}
const width = 60

const BelieverList = () => {
  const [queryData, setQueryData] = useState<QueryDataType>(initQueryData)
  const { data: trpcQueryData, isLoading } =
    trpcQuery.believer.getBelievers.useQuery(queryData, {
      keepPreviousData: true,
    })
  const data = trpcQueryData?.data || []

  const { windowHeight } = useWindowInfo()
  const handleChange: TableProps<DataType>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    const { action } = extra
    const actions = new Map([
      [
        'paginate',
        () => {
          const _page = pagination.current?.toString() || '1'
          const _limit = pagination.pageSize?.toString() || '10'
          setQueryData((prev) => ({ ...prev, _page, _limit }))
        },
      ],
      [
        'sort',
        () => {
          const singleSorter = sorter as SorterResult<DataType>
          const { order, field } = singleSorter
          if (!order) {
            setQueryData((prev) => ({
              ...prev,
              ...initQueryData,
            }))
            return
          }
          const orderKey = field?.toString() as QueryDataType['orderKey']
          const orderValue = order.replace('end', '') as 'asc' | 'desc'
          setQueryData((prev) => ({
            ...prev,
            orderKey,
            orderValue,
          }))
        },
      ],
      [
        'filter',
        () => {
          const filterData: QueryDataType = {
            ...initQueryData,
          }
          Object.keys(filters).forEach((key) => {
            if (Array.isArray(filters[key]) && filters[key] !== null) {
              const filterName = key as 'name' | 'address' | 'phone'
              const value = filters[key]?.join() as string
              filterData[filterName] = value
            }
          })
          setQueryData(filterData)
        },
      ],
    ])
    const doSomething = actions.get(action) || (() => console.log('no action'))
    doSomething?.call(this)
  }

  const tableWidth = Columns().reduce((acc, cur) => {
    const columnWidth = (cur.width || width) as number
    acc += columnWidth
    return acc
  }, 0)

  return (
    <>
      <Table
        size="small"
        loading={isLoading}
        onChange={handleChange}
        scroll={{ x: tableWidth * 1.3, y: windowHeight - 260 }}
        columns={Columns()}
        dataSource={data.map((item) => ({ ...item, key: item.id }))}
        pagination={{
          position: ['bottomCenter'],
          pageSize: parseInt(queryData?._limit || '10'),
          total: trpcQueryData?.total,
          current: parseInt(queryData?._page || '1'),
        }}
      />
    </>
  )
}

export default BelieverList

const Columns: (config?: {
  width: number
  align: 'left' | 'right' | 'center'
}) => ColumnsType<DataType> = (config = { width: 60, align: 'center' }) => {
  const { message, modal } = useAntd()
  const navigate = useNavigate()
  const utils = trpcQuery.useUtils()
  const { onOpen: onServiceModalOpen } = useServiceModalStore()
  const { colorPrimary } = useTheme()
  const similarColors = chroma
    .scale([colorPrimary, '#fb923c'])
    .mode('lch')
    .colors(5)
  const { mutate: deleteBeliever } =
    trpcQuery.believer.deleteBeliever.useMutation({
      onSuccess: () => {
        utils.believer.getBelievers.invalidate()
        utils.believer.getBelieversByFamily.invalidate()
        message.success('刪除成功')
      },
    })

  const col: ColumnsType<DataType> = [
    {
      title: '排序',
      dataIndex: 'rank',
      sorter: true,
    },
    {
      title: '姓名',
      width: 100,
      dataIndex: 'name',
      render: (_, { name, id, parentId }) => {
        return (
          <Link
            className={parentId === null ? ' text-yellow-500' : ''}
            to={`${id}`}
          >
            {name}
          </Link>
        )
      },
      ...GetColumnSearchProps(),
    },
    {
      title: '性別',
      dataIndex: 'gender',
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      width: 80,
      render: (_, { birthday }) => (
        <div>{dayjs(birthday).format('YYYY-MM-DD')}</div>
      ),
    },
    {
      title: '生肖',
      render: (_, { birthday }) => (
        <div>{lunisolar(birthday).format('cZ')}</div>
      ),
    },
    // {
    //   title: '八字',
    //   width: 130,
    //   render: (_, { birthday }) => (
    //     <div>{lunisolar(birthday).format('cY cM cD cH')}</div>
    //   ),
    // },
    // {
    //   title: '農曆年',
    //   width: 160,
    //   render: (_, { birthday }) => (
    //     <div>{lunisolar(birthday).format('cY年 lM(lL)lD lH時')}</div>
    //   ),
    // },
    {
      title: '電話',
      width: 100,
      dataIndex: 'phone',
      ...GetColumnSearchProps(),
    },
    {
      title: '地址',
      dataIndex: 'address',
      sorter: true,
      width: 200,
      ...GetColumnSearchProps(),
    },
    {
      title: '操作',
      fixed: 'right',
      width,
      render: (_, item) => {
        const { id, name, services } = item
        return (
          <DropdownButton
            content={<ExtendedButton type="primary">服務</ExtendedButton>}
          >
            {services.map((service, index) => (
              <ExtendedButton
                style={{ backgroundColor: similarColors[index] }}
                type="primary"
                key={service.id}
                onClick={() =>
                  onServiceModalOpen({
                    believer: { id, name },
                    serviceCategory: service,
                  })
                }
              >
                {service.category}
              </ExtendedButton>
            ))}
          </DropdownButton>
        )
      },
    },
  ]
  return col.map((item) => ({
    ...item,
    align: item.align || config.align,
    width: item.width || config.width,
  }))
}
