import DropdownButton from '@/components/buttons/DropdownButton'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import { GetColumnSearchProps } from '@/components/utils/GetColumnSearchProps'
import { useWindowInfo } from '@/hooks/useHook'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { TrpcInputs, TrpcOutputs } from '@/types/trpc'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { TableProps } from 'antd/lib/table/InternalTable'
import type { SorterResult } from 'antd/lib/table/interface'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type DataType = GetArrType<
  TrpcOutputs['believer']['getBelieversByFamily']['data']
>
type QueryDataType = TrpcInputs['believer']['getBelieversByFamily']

const initQueryData: QueryDataType = {
  _page: '1',
  _limit: '10',
  orderKey: 'id',
  orderValue: 'desc',
}
const width = 60

const ByFamilyList = () => {
  const [queryData, setQueryData] = useState<QueryDataType>(initQueryData)
  const { data, isLoading } = trpcQuery.believer.getBelieversByFamily.useQuery(
    queryData,
    {
      keepPreviousData: true,
    },
  )
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
        scroll={{ x: tableWidth, y: windowHeight - 260 }}
        columns={Columns()}
        dataSource={data?.data}
        pagination={{
          position: ['bottomCenter'],
          pageSize: parseInt(queryData?._limit || '10'),
          total: data?.total,
          current: parseInt(queryData?._page || '1'),
        }}
      />
    </>
  )
}

export default ByFamilyList

const Columns: (config?: {
  width: number
  align: 'left' | 'right' | 'center'
}) => ColumnsType<DataType> = (config = { width: 60, align: 'center' }) => {
  const { message, modal } = useAntd()
  const navigate = useNavigate()
  const utils = trpcQuery.useUtils()

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
      title: 'ID',
      dataIndex: 'id',
      fixed: 'left',
      sorter: true,
      render: (_, { id }) => {
        return <div className=" truncate">{id}</div>
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      render: (_, { name, id }) => {
        return <Link to={`${id}`}>{name}</Link>
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
    },
    {
      title: '電話',
      dataIndex: 'phone',
      ...GetColumnSearchProps(),
    },
    {
      title: '縣市',
      dataIndex: 'city',
      ...GetColumnSearchProps(),
    },
    {
      title: '區域',
      dataIndex: 'area',
      ...GetColumnSearchProps(),
    },
    {
      title: '地址',
      dataIndex: 'address',
      sorter: true,
      ...GetColumnSearchProps(),
    },
    {
      title: '操作',
      width,
      render: (_, { id, name }) => {
        return (
          <DropdownButton>
            <ExtendedButton type="primary" onClick={() => navigate(`${id}`)}>
              修改
            </ExtendedButton>
            <ExtendedButton type="default">服務</ExtendedButton>
            <ExtendedButton
              onClick={() => {
                modal?.confirm({
                  title: <div>{name}</div>,
                  icon: <ExclamationCircleOutlined />,
                  content: '刪除資料不可回復，確認刪除?',
                  okText: '確認',
                  cancelText: '取消',
                  onOk: () => {
                    deleteBeliever({ id })
                  },
                })
              }}
              type="primary"
              danger
              disabled={false}
            >
              刪除
            </ExtendedButton>
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
