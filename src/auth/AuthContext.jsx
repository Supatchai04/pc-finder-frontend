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


export const SUSPENDED_LOGIN_MESSAGE =
  'ไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อผู้ดูแลระบบ';


/* =========================================================
   STATUS HELPERS
   ========================================================= */

const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toUpperCase();


/*
 * รองรับหลายตำแหน่ง เผื่อ Backend ส่งกลับมาเป็น
 *
 * user.userStatus
 * userStatus
 *
 * user.shopStatus
 * user.storeStatus
 * shop.shopStatus
 * store.shopStatus
 * shopStatus
 * storeStatus
 */
const isSuspendedAuthPayload = (
  payload
) => {
  if (!payload) {
    return false;
  }


  const data =
    payload?.data &&
    typeof payload.data === 'object'
      ? payload.data
      : payload;


  const user =
    data?.user ||
    payload?.user ||
    {};


  const shop =
    data?.shop ||
    data?.store ||
    user?.shop ||
    user?.store ||
    {};


  /* USER STATUS */

  const userStatus =
    user?.userStatus ??
    user?.user_status ??
    data?.userStatus ??
    data?.user_status ??
    '';


  if (
    normalizeStatus(
      userStatus
    ) === 'SUSPENDED'
  ) {
    return true;
  }


  /* SHOP STATUS */

  const shopStatuses = [
    user?.shopStatus,
    user?.shop_status,

    user?.storeStatus,
    user?.store_status,

    shop?.shopStatus,
    shop?.shop_status,

    shop?.storeStatus,
    shop?.store_status,

    data?.shopStatus,
    data?.shop_status,

    data?.storeStatus,
    data?.store_status,
  ];


  return shopStatuses.some(
    (status) =>
      normalizeStatus(
        status
      ) === 'SUSPENDED'
  );
};


const createSuspendedError =
  () => {
    const error =
      new Error(
        SUSPENDED_LOGIN_MESSAGE
      );

    error.code =
      'ACCOUNT_SUSPENDED';

    return error;
  };


/* =========================================================
   PROVIDER
   ========================================================= */

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


  /* =========================================================
     RESTORE SESSION
     ========================================================= */

  const hydrate =
    useCallback(
      async () => {
        setLoading(true);


        const token =
          tokenStorage
            .getAccessToken();


        if (!token) {
          setUser(null);
          setLoading(false);

          return;
        }


        try {
          const response =
            await authService.me();


          const payload =
            response?.data || {};


          /*
           * ถ้าบัญชีหรือร้านถูก Suspend
           * ห้ามให้ session เดิมกลับเข้าระบบด้วย
           */
          if (
            isSuspendedAuthPayload(
              payload
            )
          ) {
            tokenStorage.clear();

            setUser(null);

            setError(
              SUSPENDED_LOGIN_MESSAGE
            );

            return;
          }


          const next =
            payload?.user;


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
      },
      []
    );


  /* =========================================================
     INITIAL AUTH
     ========================================================= */

  useEffect(() => {
    hydrate();


    const onExpired =
      () => {
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

  }, [
    hydrate,
  ]);


  /* =========================================================
     GOOGLE LOGIN
     ========================================================= */

  const loginWithGoogle =
    async (
      googleToken
    ) => {

      setError('');


      let response;


      try {
        response =
          await authService
            .googleLogin(
              googleToken
            );

      } catch (err) {

        /*
         * รองรับกรณี Backend ตอบ 4xx
         * แต่ยังส่ง status ของ account กลับมา
         */
        if (
          isSuspendedAuthPayload(
            err?.response?.data
          )
        ) {
          tokenStorage.clear();

          setUser(null);

          setError(
            SUSPENDED_LOGIN_MESSAGE
          );

          throw createSuspendedError();
        }


        throw err;
      }


      const payload =
        response?.data;


      /*
       * สำคัญ:
       * ตรวจ SUSPENDED ก่อนเก็บ Token ทุกครั้ง
       */
      if (
        isSuspendedAuthPayload(
          payload
        )
      ) {
        tokenStorage.clear();

        setUser(null);

        setError(
          SUSPENDED_LOGIN_MESSAGE
        );

        throw createSuspendedError();
      }


      if (
        !payload?.accessToken ||
        !payload?.user
      ) {
        throw new Error(
          'ระบบตอบกลับข้อมูลเข้าสู่ระบบไม่ครบถ้วน'
        );
      }


      /*
       * ผ่านการตรวจแล้วเท่านั้น
       * จึงอนุญาตให้สร้าง session
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

      setError('');


      return normalizedUser;
    };


  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout =
    async () => {

      const refreshToken =
        tokenStorage
          .getRefreshToken();


      try {
        await authService.logout(
          refreshToken
        );

      } catch {
        /*
         * Local logout ต้องสำเร็จ
         * แม้ Backend ใช้งานไม่ได้
         */
      } finally {
        tokenStorage.clear();

        setUser(null);

        setError('');
      }
    };


  /* =========================================================
     CONTEXT
     ========================================================= */

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


export const useAuth =
  () =>
    useContext(
      AuthContext
    );