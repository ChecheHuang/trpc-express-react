import Group from '@/components/Group'
import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import Container from '@/components/container/Container'
import { useWindowInfo } from '@/hooks/useHook'
import { SizeType } from '@/store/useTheme'
import { Form, Input, Table } from 'antd'
import { FormItemProps, Rule } from 'antd/es/form'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { FilterValue, SorterResult } from 'antd/es/table/interface'
import { TableProps } from 'antd/lib/table/InternalTable'

interface TemplateProps<T> extends TableProps<T> {
  data: T[]
  columns: AnyObject[]
  onPaginate?: (pagination: TablePaginationConfig) => void
  onSort?: (sorter: SorterResult<T> | SorterResult<T>[]) => void
  onFilter?: (filters: Record<string, FilterValue | null>) => void
  onSelect?: (selectedRows: T[]) => void
  templateTableProps?: TemplateTableProps

  searchLayoutArray?: SearchLayoutType[]
  onSearch?: (value: any) => void
  searchText?: string

  onResetSearch?: () => void
  withOutContainer?: boolean
  tableTopContent?: React.ReactNode
}
export interface SearchLayoutType extends FormItemProps<string> {
  label: string
  name: string
  content?: React.ReactNode
  className?: string
  rules?: Rule[]
}

type TemplateTableProps = {
  width?: number
  align?: 'center' | 'left' | 'right'
}

const TableTemplate = <T extends AnyObject>(props: TemplateProps<T>) => {
  const {
    data,
    columns,
    templateTableProps,
    onPaginate,
    onSort,
    onFilter,
    onSelect,
    searchLayoutArray,
    onSearch,
    onResetSearch,
    withOutContainer = false,
    tableTopContent,
    searchText = '查詢',
    ...rest
  } = props
  const width = templateTableProps?.width || 60
  const align = templateTableProps?.align || 'center'
  const { windowHeight } = useWindowInfo()
  const [form] = Form.useForm()

  const handleChange: TableProps<T>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    const { action } = extra
    const actions = new Map([
      ['paginate', () => onPaginate && onPaginate(pagination)],
      ['sort', () => onSort && onSort(sorter)],
      ['filter', () => onFilter && onFilter(filters)],
    ])
    const doSomething = actions.get(action) || (() => console.log('no action'))
    doSomething?.call(this)
  }

  const dataColumns: ColumnsType<T> = columns.map((col) => {
    const modifiedCol = {
      key: col.key ? col.key : col.dataIndex ? col.dataIndex : col.title,
      align,
      width,
      ...col,
    }
    return modifiedCol
  })

  const tableWidth: number = dataColumns.reduce((acc, cur) => {
    acc += cur.width as number
    return acc
  }, 0)
  const handleReset = () => {
    form.resetFields()
    onResetSearch && onResetSearch()
  }

  const myTable = (
    <>
      {tableTopContent && tableTopContent}
      <Table
        size="small"
        onChange={handleChange}
        scroll={{
          x: tableWidth,
          y: props.pagination ? windowHeight - 200 : windowHeight - 140,
        }}
        columns={dataColumns}
        dataSource={addKeyToObject(data)}
        pagination={{ position: ['bottomCenter'] }}
        rowSelection={
          onSelect
            ? {
                type: 'checkbox',
                onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => {
                  onSelect(selectedRows)
                },
              }
            : undefined
        }
        {...rest}
      />
    </>
  )

  const searchArea = (
    <>
      {searchLayoutArray && searchLayoutArray?.length !== 0 && (
        <MyCard className="mb-3">
          <Form layout={'vertical'} form={form} onFinish={onSearch}>
            <Group className="relative" size={SizeType.small} unstyled>
              {searchLayoutArray?.map(
                ({ label, name, content, className, rules, ...rest }) => {
                  return (
                    <Form.Item
                      className={className}
                      label={label}
                      key={name}
                      name={name}
                      rules={rules}
                      {...rest}
                    >
                      {content ? (
                        content
                      ) : (
                        <Input placeholder={`請輸入${label}`} />
                      )}
                    </Form.Item>
                  )
                },
              )}
              <div className="  col-span-full flex items-center justify-end  gap-3">
                <ExtendedButton onClick={handleReset} danger>
                  清除
                </ExtendedButton>
                <ExtendedButton type="primary" htmlType="submit">
                  {searchText}
                </ExtendedButton>
              </div>
            </Group>
          </Form>
        </MyCard>
      )}
    </>
  )

  if (withOutContainer) {
    return (
      <>
        {searchArea}
        {myTable}
      </>
    )
  }
  return (
    <Container>
      {searchArea}
      <MyCard>{myTable}</MyCard>
    </Container>
  )
}

export default TableTemplate
function addKeyToObject(obj: any, keyField?: string): any {
  let key = 1
  return addKey(obj, keyField || '')

  function addKey(obj: any, keyField: string): any {
    if (Array.isArray(obj)) {
      return obj.map((item: any) => addKey(item, keyField))
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = { ...obj }
      newObj.key =
        newObj[keyField] !== undefined
          ? String(newObj[keyField])
          : String(key++)

      if (newObj.children) {
        newObj.children = addKey(newObj.children, keyField).map(
          (child: any) => {
            child.key = `${newObj.key}-${child.key}`
            return child
          },
        )
      }
      return newObj
    } else {
      return obj
    }
  }
}
