import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authService } from '../services/authService';
import { shopService } from '../services/shopService';

import { tokenStorage } from './tokenStorage';

import {
  normalizeRole,
  ROLES,
} from './roles';


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


const getPayloadData = (
  payload
) => {
  if (
    payload?.data &&
    typeof payload.data ===
    'object'
  ) {
    return payload.data;
  }

  return payload || {};
};


/*
 * ตรวจได้ทั้ง
 *
 * user.userStatus
 * data.userStatus
 *
 * user.shopStatus
 * shop.shopStatus
 * store.shopStatus
 * storeInfo.shopStatus
 *
 * เพื่อรองรับ Response หลายรูปแบบของ Backend
 */
const isSuspendedPayload = (
  payload
) => {
  if (!payload) {
    return false;
  }


  const data =
    getPayloadData(
      payload
    );


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


  const storeInfo =
    data?.storeInfo ||
    {};


  const statusInfo =
    data?.status ||
    {};


  /* =========================
     USER STATUS
     ========================= */

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


  /* =========================
     SHOP STATUS
     ========================= */

  const shopStatuses = [
    user?.shopStatus,
    user?.shop_status,

    user?.storeStatus,
    user?.store_status,

    shop?.shopStatus,
    shop?.shop_status,

    shop?.storeStatus,
    shop?.store_status,

    storeInfo?.shopStatus,
    storeInfo?.shop_status,

    statusInfo?.shopStatus,
    statusInfo?.shop_status,

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


/*
 * รองรับกรณี Backend ไม่คืน shopStatus
 * แต่บล็อก API ร้านแล้วตอบข้อความว่า
 * "ร้านค้าไม่พร้อมใช้งาน"
 */
const isSuspendedError = (
  error
) => {
  if (
    isSuspendedPayload(
      error?.response?.data
    )
  ) {
    return true;
  }


  const message =
    String(
      error?.response?.data
        ?.message ||
      error?.response?.data
        ?.errorDetails ||
      error?.message ||
      ''
    )
      .trim()
      .toLowerCase();


  return (
    message.includes(
      'suspended'
    ) ||
    message.includes(
      'ถูกระงับ'
    ) ||
    message.includes(
      'ระงับการใช้งาน'
    ) ||
    message.includes(
      'ร้านค้าไม่พร้อมใช้งาน'
    )
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
   AUTH PROVIDER
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
     BLOCK SUSPENDED SESSION
     ========================================================= */

  const rejectSuspendedSession =
    useCallback(
      () => {
        /*
         * สำคัญ:
         * ถ้าถูก Suspend ต้องไม่เหลือ Token
         * และต้องไม่เหลือ User ใน Context
         */
        tokenStorage.clear();

        setUser(null);

        setError(
          SUSPENDED_LOGIN_MESSAGE
        );
      },
      []
    );


  /* =========================================================
     VERIFY SHOP STATUS
     ========================================================= */

  const verifyShopAccess =
    useCallback(
      async () => {
        try {
          /*
           * ใช้ Dashboard เป็นตัวตรวจสิทธิ์ร้าน
           *
           * จากระบบปัจจุบัน:
           * ร้านที่ใช้งานได้ -> API ผ่าน
           * ร้าน SUSPENDED -> Backend ตอบ
           * "ร้านค้าไม่พร้อมใช้งาน"
           */
          const response =
            await shopService
              .dashboard();


          /*
           * เผื่อ Backend ส่ง
           * shopStatus กลับมาด้วย
           */
          if (
            isSuspendedPayload(
              response
            )
          ) {
            throw createSuspendedError();
          }


          return true;

        } catch (
        shopError
        ) {
          /*
           * ตรวจเฉพาะกรณี Suspend
           */
          if (
            shopError?.code ===
            'ACCOUNT_SUSPENDED' ||
            isSuspendedError(
              shopError
            )
          ) {
            throw createSuspendedError();
          }


          /*
           * ถ้าเป็น Error อื่น เช่น
           * Network / Server 500
           *
           * ไม่ตีความว่าโดน Suspend
           * เพื่อไม่ Block ผู้ใช้ผิดกรณี
           */
          return true;
        }
      },
      []
    );


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
          /*
           * ตรวจ User จาก Token เดิม
           */
          const response =
            await authService.me();


          const payload =
            response?.data ||
            {};


          /*
           * ถ้า userStatus = SUSPENDED
           * ห้าม Restore Session
           */
          if (
            isSuspendedPayload(
              payload
            )
          ) {
            rejectSuspendedSession();

            return;
          }


          const next =
            payload?.user;


          if (!next) {
            tokenStorage.clear();

            setUser(null);

            return;
          }


          const normalizedUser = {
            ...next,

            role:
              normalizeRole(
                next.role
              ),
          };


          /*
           * ถ้าเป็น SHOP
           *
           * userStatus อาจ ACTIVE
           * แต่ตัวร้านอาจเป็น SUSPENDED
           *
           * จึงต้องตรวจสถานะร้านอีกชั้น
           * ก่อนอนุญาตให้ Restore Session
           */
          if (
            normalizedUser.role ===
            ROLES.SHOP
          ) {
            try {
              await verifyShopAccess();

            } catch (
            shopError
            ) {
              if (
                shopError?.code ===
                'ACCOUNT_SUSPENDED'
              ) {
                rejectSuspendedSession();

                return;
              }


              throw shopError;
            }
          }


          /*
           * ผ่านทุกการตรวจแล้ว
           * ถึงจะอนุญาตให้เข้าระบบ
           */
          setUser(
            normalizedUser
          );

          setError('');

        } catch (
        authError
        ) {
          if (
            authError?.code ===
            'ACCOUNT_SUSPENDED' ||
            isSuspendedError(
              authError
            )
          ) {
            rejectSuspendedSession();

          } else {
            tokenStorage.clear();

            setUser(null);
          }

        } finally {
          setLoading(false);
        }
      },
      [
        rejectSuspendedSession,
        verifyShopAccess,
      ]
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


    return () => {
      window.removeEventListener(
        'pcfinder:auth-expired',
        onExpired
      );
    };

  }, [
    hydrate,
  ]);


  /* =========================================================
     GOOGLE LOGIN
     ========================================================= */

  const loginWithGoogle =
    useCallback(
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

        } catch (
        loginError
        ) {
          /*
           * รองรับกรณี Backend
           * ตอบ Error 4xx พร้อม
           * userStatus = SUSPENDED
           */
          if (
            isSuspendedPayload(
              loginError
                ?.response
                ?.data
            ) ||
            isSuspendedError(
              loginError
            )
          ) {
            rejectSuspendedSession();

            throw createSuspendedError();
          }


          throw loginError;
        }


        const payload =
          response?.data;


        /* =========================
           CHECK USER STATUS
           ========================= */

        /*
         * สำคัญมาก:
         *
         * ตรวจ SUSPENDED
         * ก่อนสร้าง Session ทุกครั้ง
         */
        if (
          isSuspendedPayload(
            payload
          )
        ) {
          rejectSuspendedSession();

          throw createSuspendedError();
        }


        if (
          !payload
            ?.accessToken ||
          !payload
            ?.user
        ) {
          throw new Error(
            'ระบบตอบกลับข้อมูลเข้าสู่ระบบไม่ครบถ้วน'
          );
        }


        const normalizedUser = {
          ...payload.user,

          role:
            normalizeRole(
              payload.user.role
            ),
        };


        /*
         * Private Shop API ต้องใช้ Token
         *
         * จึงเก็บ Token ชั่วคราวก่อนตรวจร้าน
         *
         * แต่ยังไม่ setUser
         * ดังนั้นยังไม่ได้เข้า Dashboard
         */
        tokenStorage.setTokens(
          payload
        );


        /* =========================
           CHECK SHOP STATUS
           ========================= */

        if (
          normalizedUser.role ===
          ROLES.SHOP
        ) {
          try {
            await verifyShopAccess();

          } catch (
          shopError
          ) {
            /*
             * ถ้าร้าน SUSPENDED:
             *
             * - ล้าง Token
             * - ไม่ setUser
             * - ไม่เข้า /shop
             * - เปิด Modal หน้า Login
             */
            if (
              shopError?.code ===
              'ACCOUNT_SUSPENDED'
            ) {
              rejectSuspendedSession();

              throw createSuspendedError();
            }


            throw shopError;
          }
        }


        /*
         * ผ่านทั้ง userStatus
         * และ shopStatus แล้ว
         *
         * จึง Login สำเร็จจริง
         */
        setUser(
          normalizedUser
        );

        setError('');


        return normalizedUser;
      },
      [
        rejectSuspendedSession,
        verifyShopAccess,
      ]
    );


  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout =
    useCallback(
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
           * Local logout
           * ต้องสำเร็จแม้ Backend ล่ม
           */

        } finally {
          tokenStorage.clear();

          setUser(null);

          setError('');
        }
      },
      []
    );


  /* =========================================================
     CONTEXT VALUE
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
        loginWithGoogle,
        logout,
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