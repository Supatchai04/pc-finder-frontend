import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authService } from '../services/authService';
import { tokenStorage } from './tokenStorage';
import { normalizeRole } from './roles';


const AuthContext =
  createContext(null);


const SUSPENDED_MESSAGE =
  'ไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อผู้ดูแลระบบ';


const isSuspendedUser = (user) => {
  return (
    String(
      user?.userStatus || ''
    ).toUpperCase() ===
    'SUSPENDED'
  );
};


export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');


  /*
   * ============================================
   * RESTORE SESSION
   * ============================================
   */

  const hydrate =
    useCallback(async () => {
      setLoading(true);

      const token =
        tokenStorage.getAccessToken();


      if (!token) {
        setUser(null);
        setLoading(false);

        return;
      }


      try {
        const response =
          await authService.me();


        const next =
          response?.data?.user;


        /*
         * ถ้าบัญชีถูก Suspend
         * ห้าม Restore Session เดิมกลับมา
         */
        if (
          next &&
          isSuspendedUser(next)
        ) {
          tokenStorage.clear();

          setUser(null);

          setError(
            SUSPENDED_MESSAGE
          );

          return;
        }


        setUser(
          next
            ? {
                ...next,
                role:
                  normalizeRole(
                    next.role
                  ),
              }
            : null
        );
      } catch {
        tokenStorage.clear();

        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);


  /*
   * ============================================
   * INITIAL AUTH
   * ============================================
   */

  useEffect(() => {
    hydrate();


    const onExpired = () => {
      tokenStorage.clear();

      setUser(null);

      setError(
        'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
      );
    };


    window.addEventListener(
      'pcfinder:auth-expired',
      onExpired
    );


    return () =>
      window.removeEventListener(
        'pcfinder:auth-expired',
        onExpired
      );
  }, [hydrate]);


  /*
   * ============================================
   * GOOGLE LOGIN
   * ============================================
   */

  const loginWithGoogle =
    async (googleToken) => {
      setError('');


      const response =
        await authService.googleLogin(
          googleToken
        );


      const payload =
        response?.data;


      if (
        !payload?.accessToken ||
        !payload?.user
      ) {
        throw new Error(
          'ระบบตอบกลับข้อมูลเข้าสู่ระบบไม่ครบถ้วน'
        );
      }


      /*
       * ==========================================
       * BLOCK SUSPENDED USER
       * ==========================================
       *
       * ต้องตรวจตรงนี้ก่อน setTokens()
       * และก่อน setUser()
       */

      if (
        isSuspendedUser(
          payload.user
        )
      ) {
        /*
         * กัน Token เก่าค้างอยู่
         */
        tokenStorage.clear();


        /*
         * ห้ามให้ AuthContext ถือว่า Login แล้ว
         */
        setUser(null);


        setError(
          SUSPENDED_MESSAGE
        );


        /*
         * Popup ตาม Requirement
         */
        window.alert(
          SUSPENDED_MESSAGE
        );


        /*
         * Throw เพื่อหยุด Flow ใน LoginPage
         * ไม่ให้คำสั่ง navigate() หลัง await ทำงาน
         */
        const suspendedError =
          new Error(
            SUSPENDED_MESSAGE
          );

        suspendedError.code =
          'ACCOUNT_SUSPENDED';

        throw suspendedError;
      }


      /*
       * ==========================================
       * ACTIVE USER
       * ==========================================
       */

      tokenStorage.setTokens(
        payload
      );


      const normalizedUser = {
        ...payload.user,

        role:
          normalizeRole(
            payload.user.role
          ),
      };


      setUser(
        normalizedUser
      );


      return normalizedUser;
    };


  /*
   * ============================================
   * LOGOUT
   * ============================================
   */

  const logout =
    async () => {
      const refreshToken =
        tokenStorage.getRefreshToken();


      try {
        await authService.logout(
          refreshToken
        );
      } catch {
        /*
         * Local logout ต้องสำเร็จเสมอ
         * แม้ Backend ใช้งานไม่ได้
         */
      } finally {
        tokenStorage.clear();

        setUser(null);

        setError('');
      }
    };


  /*
   * ============================================
   * CONTEXT VALUE
   * ============================================
   */

  const value =
    useMemo(
      () => ({
        user,
        loading,
        error,
        setError,

        loginWithGoogle,
        logout,

        refreshSession:
          hydrate,
      }),
      [
        user,
        loading,
        error,
        hydrate,
      ]
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () =>
  useContext(AuthContext);