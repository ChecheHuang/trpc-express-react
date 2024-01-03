import { DisplayDataType, RouteType, getRoutes } from './_api'
import { ColumnTypes, EditableCell, EditableRow } from './_components/Editable'
import Loading from '@/components/Loading'
import Container from '@/components/container/Container'
import TableTemplate from '@/components/table/TableTemplate'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery } from '@/provider/TrpcProvider'
import { useQuery } from '@tanstack/react-query'
import { Switch } from 'antd'

const DevPage = () => {
  const { message } = useAntd()

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['dev', 'routes'],
    queryFn: getRoutes,
  })

  const { mutate: createMutate, isLoading: creatIng } =
    trpcQuery.dev.createRouter.useMutation({
      onSuccess: () => {
        message.success('新增成功')
        refetch()
      },
      onError: (error) => {
        console.log(error)
      },
    })

  const { mutate: putMutate, isLoading: putIng } =
    trpcQuery.dev.editRouter.useMutation({
      onSuccess: () => {
        message.success('修改成功')
        refetch()
      },
    })

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean
    dataIndex?: string
  })[] = [
    {
      width: 20,
      fixed: 'left',
      align: 'center',
    },
    {
      title: '上傳',
      fixed: 'left',
      width: 20,
      key: 'operation',
      render: (item: DisplayDataType) => {
        const { isUpload, parentPath } = item
        return (
          <Switch
            disabled={isUpload || creatIng}
            checked={isUpload}
            onChange={async (checked: boolean) => {
              const route = (function changeDataFn(
                item: DisplayDataType,
              ): RouteType {
                const { path, frontEndName: name, children, isUpload } = item
                return {
                  path,
                  name,
                  ...(children
                    ? {
                        children: children
                          .filter((item) => !item.isUpload)
                          .map((item) => changeDataFn(item)),
                      }
                    : {}),
                }
              })(item)

              createMutate({ route: [route], parentPath })
            }}
          />
        )
      },
    },
    {
      title: '路徑',
      dataIndex: 'path',
      key: 'path',
      align: 'left',
    },
    {
      title: '前端名稱',
      dataIndex: 'frontEndName',
      key: 'frontEndName',
    },
    {
      title: '後端名稱',
      dataIndex: 'backEndName',
      key: 'backEndName',
      editable: true,
    },
  ]

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DisplayDataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: ({ id, backEndName: name }: DisplayDataType) => {
          putMutate({ id, name })
        },
      }),
    }
  })
  if (!data) return <Loading />

  return (
    <>
      <Container>
        <TableTemplate
          components={components}
          withOutContainer
          columns={columns as ColumnTypes}
          data={data}
          pagination={false}
          loading={isLoading}
          expandable={{
            defaultExpandAllRows: true,
          }}
        />
      </Container>
    </>
  )
}

export default DevPage
