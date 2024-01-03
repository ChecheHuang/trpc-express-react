import { create } from 'zustand'

type UserInfo = {
  name?: string
  roles?: string[]
  routes?: {
    path: RegExp
    name: string
    isAllow: boolean
  }[]
}

export type UserStoreType = {
  isLogin?: boolean
  setUser: (userInfo: Required<UserInfo>) => void
} & UserInfo

export const useUserStore = create<UserStoreType>((set) => ({
  name: undefined,
  roles: undefined,
  routes: undefined,
  isLogin: false,
  setUser: async (userInfo) => {
    set({ ...userInfo, isLogin: true })
  },
}))
