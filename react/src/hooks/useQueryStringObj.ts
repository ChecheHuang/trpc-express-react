import { useUpdateEffect } from '@/hooks/useHook'
import { filterObjectValueByArg } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type Callback<T> = (prevState: T) => T

const removeUndefinedAndNullAndEmpty = <T extends AnyObject>(obj: T) =>
  filterObjectValueByArg(obj, undefined, null, '')

export default function useQueryStringObj<T>(
  initialState: T,
): [T, (newState: T | Callback<T>) => void] {
  const [state, setState] = useState<T>(initialState)
  const [params, setParams] = useSearchParams()

  const paramsObject = useMemo(() => {
    const paramsObject: Record<string | number, any> = {}
    for (const [name, value] of params) {
      paramsObject[name] = value
    }
    return paramsObject
  }, [params])

  useEffect(() => {
    setState(removeUndefinedAndNullAndEmpty(paramsObject) as T)
  }, [setState, paramsObject])

  useUpdateEffect(() => {
    if (typeof state === 'function') {
      setState((prevState) => (state as Callback<T>)(prevState))
    } else {
      setParams(
        removeUndefinedAndNullAndEmpty(state as Record<string | number, any>),
      )
    }
  }, [state])

  return [state, setState]
}
