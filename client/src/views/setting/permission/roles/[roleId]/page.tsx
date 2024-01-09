import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import Container from '@/components/container/Container'
import TableTemplate from '@/components/table/TableTemplate'
import useQueryStringObj from '@/hooks/useQueryStringObj'
import { flattenChildren } from '@/lib/utils'
import { useAntd } from '@/provider/AntdProvider'
import { trpcQuery,TrpcOutputs } from '@/provider/TrpcProvider'
import { SearchOutlined } from '@ant-design/icons'
import { Input, Tabs, Switch } from 'antd'
import type { TabsProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { useParams } from 'react-router-dom'

type RouteType = GetArrType<TrpcOutputs['permission']['getRole']['routes']>
type ApiType = GetArrType<TrpcOutputs['permission']['getRole']['apiList']>

const Page = () => {
  const { message } = useAntd()
  const roleId = useParams().roleId as string
  const [queryStringObj, setQueryStringObj] = useQueryStringObj<{
    name?: string
  }>({})
  const { data, isLoading, refetch } = trpcQuery.permission.getRole.useQuery({
    roleId,
    // ...queryStringObj,
  })

  const { mutate: mutateRoute, isLoading: mutateRouteLoading } =
    trpcQuery.permission.updateRoleRoute.useMutation({
      onSuccess: () => {
        refetch()
        message.success('修改成功')
      },
    })

  const { mutate: mutateApi, isLoading: mutateApiLoading } =
    trpcQuery.permission.updateRoleApi.useMutation({
      onSuccess: () => {
        refetch()
        message.success('修改成功')
      },
    })

  const routesColumns: ColumnsType<RouteType> = [
    {
      width: 20,
      fixed: 'left',
      align: 'center',
    },
    {
      title: '操作',
      fixed: 'left',
      width: 20,
      key: 'operation',
      render: ({ isAllow, routeId, children }: RouteType) => {
        return (
          <Switch
            checked={isAllow}
            onChange={(checked: boolean) => {
              const childrenRouteIds = children
                ? flattenChildren(children).map((route) => route.routeId)
                : []
              const routeIds = [routeId, ...childrenRouteIds]
              mutateRoute({
                roleId,
                routeIds,
                isAllow: checked,
              })
            }}
          />
        )
      },
    },
    {
      title: '名稱',
      dataIndex: 'name',
      // filterIcon,
      // filterDropdown,
      // defaultFilteredValue: [queryStringObj?.name || ''],
    },
    {
      title: '路徑',
      dataIndex: 'path',
      align: 'left',
    },
  ]

  const apiListColumns: ColumnsType<ApiType> = [
    {
      title: '可操作',
      fixed: 'left',
      width: 40,
      key: 'operation',
      render: ({ isAllow, id }: ApiType) => {
        return (
          <Switch
            checked={isAllow}
            onChange={(checked: boolean) => {
              mutateApi({
                roleId,
                apiId: id,
                isAllow: checked,
              })
            }}
          />
        )
      },
    },
    {
      title: 'router',
      dataIndex: 'router',
    },
    {
      title: 'name',
      dataIndex: 'name',
    },
    {
      title: 'swaggerSummary',
      dataIndex: 'swaggerSummary',
    },
    {
      title: 'swaggerMethod',
      dataIndex: 'swaggerMethod',
    },
  ]

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '路由管理',
      children: (
        <TableTemplate
          withOutContainer
          data={data?.routes || []}
          columns={routesColumns}
          templateTableProps={{ width: 110, align: 'center' }}
          loading={isLoading || mutateRouteLoading}
          pagination={false}
          expandable={{
            defaultExpandAllRows: true,
          }}
          onFilter={({ name }) => {
            if (name === null) {
              setQueryStringObj({})
              return
            }
            setQueryStringObj({ name: name[0] as string })
          }}
        />
      ),
    },
    {
      key: '2',
      label: 'api管理',
      children: (
        <TableTemplate
          withOutContainer
          data={data?.apiList || []}
          columns={apiListColumns}
          templateTableProps={{ width: 110, align: 'left' }}
          loading={isLoading || mutateApiLoading}
          pagination={false}
          expandable={{
            defaultExpandAllRows: true,
          }}
          onFilter={({ name }) => {
            if (name === null) {
              setQueryStringObj({})
              return
            }
            setQueryStringObj({ name: name[0] as string })
          }}
        />
      ),
    },
  ]

  return (
    <>
      <Container>
        <MyCard>
          <h1>角色權限管理-{data?.role}</h1>
          <Tabs defaultActiveKey="2" items={items} />
        </MyCard>
      </Container>
    </>
  )
}

export default Page

const filterIcon = (filtered: boolean) => (
  <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
)
const filterDropdown = (props: FilterDropdownProps) => {
  const { selectedKeys, setSelectedKeys, confirm, clearFilters } = props
  const handleReset = () => {
    clearFilters?.()
    confirm({ closeDropdown: true })
  }
  return (
    <div className="p-2">
      <Input
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => confirm()}
        value={selectedKeys[0]}
      />
      <div className="mt-2 flex justify-around gap-2">
        <ExtendedButton
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => confirm()}
        >
          搜尋
        </ExtendedButton>
        <ExtendedButton onClick={handleReset}>重置</ExtendedButton>
        <ExtendedButton danger onClick={() => confirm({ closeDropdown: true })}>
          取消
        </ExtendedButton>
      </div>
    </div>
  )
}
