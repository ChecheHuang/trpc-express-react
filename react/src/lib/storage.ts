export const storage = {
  get(key: string) {
    const item = localStorage.getItem(key)
    if (!item) return false
    return JSON.parse(item)
  },
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  },
}
