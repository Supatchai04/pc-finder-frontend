import axios from 'axios'
import { tokenStore } from '../utils/tokenStore.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStore.getAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshPromise = null

async function requestNewAccessToken(refreshToken) {
  const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  })
  return data.data.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes('/api/auth/refresh')

    if (!isUnauthorized || originalRequest?._retry || isRefreshRequest) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      tokenStore.clear()
      window.dispatchEvent(new Event('pcfinder:session-expired'))
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ||= requestNewAccessToken(refreshToken).finally(() => {
        refreshPromise = null
      })
      const newAccessToken = await refreshPromise
      tokenStore.setAccessToken(newAccessToken)
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      tokenStore.clear()
      window.dispatchEvent(new Event('pcfinder:session-expired'))
      return Promise.reject(refreshError)
    }
  },
)
