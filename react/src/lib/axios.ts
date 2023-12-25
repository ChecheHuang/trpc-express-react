import { storage } from './storage'
import { wait } from './utils'
import { trpcClient } from '@/provider/TrpcProvider'
import { message } from 'antd'
import originAxios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'

const axios: AxiosInstance = originAxios.create({
  baseURL: '/api',
  timeout: 10000,
})

axios.interceptors.request.use(
  (config) => {
    const token = storage.get('jwt')?.access
    if (token !== null) {
      config.headers['authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const text = error.response?.data || error.config!.url || '伺服器錯誤'
    if (text === 'Token已過期') {
      try {
        const refresh = storage.get('jwt')?.refresh
        const jwt = await trpcClient.auth.refreshToken.mutate({
          refreshToken: refresh,
        })
        storage.set('jwt', jwt)

        const originalRequest = error.config!
        originalRequest.headers['Authorization'] = `Bearer ${jwt.access}`
        return axios.request(originalRequest)
      } catch (err) {
        await wait(1000)
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    message.error(text as string)

    return Promise.reject(error)
  },
)

export default axios
