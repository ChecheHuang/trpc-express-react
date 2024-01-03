import { FormInstance } from 'antd'
import { create } from 'zustand'

type FormAndDataStore<T> = {
  form: FormInstance
  setForm: (form: FormInstance) => void
  data: T
  setData: (data: T, roles?: string[]) => void
}
export const useFormAndData = create<FormAndDataStore<any>>((set) => ({
  form: {} as FormInstance,
  data: {},
  setForm: (form) => set({ form }),
  setData: (data) => set({ data }),
}))
