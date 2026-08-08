import axios from 'axios'
import { apiClient } from '../api/apiClient.js'
import { mockCurrentUser, mockGoogleLogin, mockLogout, mockRefreshToken } from '../mocks/auth.mock.js'

const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function loginWithGoogle(googleToken) {
  if (useMock) return mockGoogleLogin()
  const { data } = await apiClient.post('/api/auth/google', { googleToken })
  return data
}

export async function getCurrentUser() {
  if (useMock) return mockCurrentUser()
  const { data } = await apiClient.get('/api/auth/me')
  return data
}

export async function logoutRequest(refreshToken) {
  if (useMock) return mockLogout()
  const { data } = await apiClient.post('/api/auth/logout', { refreshToken })
  return data
}

// Export ไว้สำหรับทดสอบเส้น refresh โดยตรงถ้าต้องการ
export async function refreshAccessToken(refreshToken) {
  if (useMock) {
    const response = await mockRefreshToken()
    return response.data.accessToken
  }
  const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken })
  return data.data.accessToken
}
