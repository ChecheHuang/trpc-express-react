import { create } from 'zustand'

export enum SizeType {
  small = 'small',
  middle = 'middle',
  large = 'large',
}
type ThemeStoreType = {
  mode: 'light' | 'dark'
  toggleMode: () => void
  colorPrimary: string
  changeColor: (color: string) => void
  size: SizeType
  changeSize: (size: SizeType) => void
}

const defaultColor = localStorage.getItem('colorPrimary') || '#a71b4f81'
// const defaultColor = localStorage.getItem('colorPrimary') || '#1677ff'
export const useTheme = create<ThemeStoreType>((set) => ({
  mode: 'dark',
  toggleMode() {
    set((state) => ({
      ...state,
      mode: state.mode === 'dark' ? 'light' : 'dark',
    }))
  },
  colorPrimary: defaultColor,
  changeColor(color) {
    set((state) => ({
      ...state,
      colorPrimary: color,
    }))
  },
  size: SizeType.middle,
  changeSize(size) {
    set((state) => ({
      ...state,
      size: size,
    }))
  },
}))
