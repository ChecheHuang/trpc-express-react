import './plugin'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as XLSX from 'xlsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const wait = (number: number) =>
  new Promise((resolve) => setTimeout(resolve, number))

export const debounce = (fn: (...args: any[]) => any, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

export const filterObjectValueByArg = <T extends AnyObject>(
  obj: T,
  ...arg: unknown[]
) => {
  const newObj = {} as T
  for (const key in obj) {
    const isObj = !!Object.prototype.hasOwnProperty.call(obj, key)
    if (!isObj) throw new Error('not an object')
    const isSkip = arg.reduce((acc, cur) => acc || obj[key] === cur, false)
    if (!isSkip) newObj[key] = obj[key]
  }
  return newObj
}

export function flattenChildren<T extends { path?: string; children?: T[] }>(
  flattenArray: T[],
  propertiesToRemove: (keyof Omit<T, 'children'>)[] = [],
): Omit<T, 'children'>[] {
  const result: Omit<T, 'children'>[] = []
  for (const { children, ...rest } of flattenArray) {
    const updatedRest = { ...rest }
    for (const property of propertiesToRemove) {
      delete updatedRest[property]
    }
    result.push(updatedRest as Omit<T, 'children'>)
    if (children) {
      result.push(...flattenChildren(children, propertiesToRemove))
    }
  }
  return result
}

export const readExcel = (file: File) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    fileReader.onload = (e) => {
      const bufferArray = e.target?.result
      const wb = XLSX.read(bufferArray, { type: 'buffer' })
      const wsName = wb.SheetNames[0]
      const ws = wb.Sheets[wsName]
      const data = XLSX.utils.sheet_to_json(ws)
      resolve(data)
    }
    fileReader.onerror = (error) => {
      reject(error)
    }
  })

export const exportExcel = (
  data: Record<string, any>[],
  fileName = 'excel',
  sheetName = 'sheet',
) => {
  const wb = XLSX.utils.book_new(),
    ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

export function dataURLToBlob(dataURL: string) {
  const arr = dataURL.split(',')
  const mime = arr[0]?.match(/:(.*?);/)?.[1] ?? ''
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
