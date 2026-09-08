import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from './tokenStorage';
import { normalizeRole } from './roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hydrate = useCallback(async () => {
    setLoading(true);
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await authService.me();
      const next = response?.data?.user;
      setUser(next ? { ...next, role: normalizeRole(next.role) } : null);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
    const onExpired = () => {
      tokenStorage.clear();
      setUser(null);
      setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    };
    window.addEventListener('pcfinder:auth-expired', onExpired);
    return () => window.removeEventListener('pcfinder:auth-expired', onExpired);
  }, [hydrate]);

  const loginWithGoogle = async (googleToken) => {
    setError('');
    const response = await authService.googleLogin(googleToken);
    const payload = response?.data;
    if (!payload?.accessToken || !payload?.user) {
      throw new Error('ระบบตอบกลับข้อมูลเข้าสู่ระบบไม่ครบถ้วน');
    }
    tokenStorage.setTokens(payload);
    const normalizedUser = { ...payload.user, role: normalizeRole(payload.user.role) };
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await authService.logout(refreshToken);
    } catch {
      // Local logout must always succeed even when Backend is unavailable.
    } finally {
      tokenStorage.clear();
      setUser(null);
      setError('');
    }
  };

  const value = useMemo(() => ({ user, loading, error, setError, loginWithGoogle, logout, refreshSession: hydrate }), [user, loading, error, hydrate]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
