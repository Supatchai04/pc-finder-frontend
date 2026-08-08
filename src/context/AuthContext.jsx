import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginWithGoogle, logoutRequest } from '../services/authService.js'
import { tokenStore } from '../utils/tokenStore.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const clearSession = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const restoreSession = useCallback(async () => {
    const accessToken = tokenStore.getAccessToken()
    if (!accessToken) {
      setInitializing(false)
      return
    }

    try {
      const response = await getCurrentUser()
      setUser(response.data.user)
    } catch {
      clearSession()
    } finally {
      setInitializing(false)
    }
  }, [clearSession])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    const handleExpired = () => clearSession()
    window.addEventListener('pcfinder:session-expired', handleExpired)
    return () => window.removeEventListener('pcfinder:session-expired', handleExpired)
  }, [clearSession])

  const login = useCallback(async (googleToken = 'mock-google-token') => {
    const response = await loginWithGoogle(googleToken)
    tokenStore.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    })
    setUser(response.data.user)
    return response.data.user
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken()
    try {
      await logoutRequest(refreshToken)
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    logout,
  }), [user, initializing, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
