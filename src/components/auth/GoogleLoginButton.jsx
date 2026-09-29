import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Button,
  Spinner,
} from 'react-bootstrap';

import { useAuth } from '../../auth/AuthContext';
import { isMockEnabled } from '../../utils/api';


const useMock =
  isMockEnabled();

const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;


export default function GoogleLoginButton({
  onSuccess,
}) {
  const {
    loginWithGoogle,
  } = useAuth();


  const hostRef =
    useRef(null);


  const [
    busy,
    setBusy,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState('');


  /*
   * ============================================
   * LOGIN
   * ============================================
   */

  const finishLogin =
    async (
      credential =
        'mock-google-token'
    ) => {

      setBusy(true);
      setMessage('');


      try {
        const user =
          await loginWithGoogle(
            credential
          );


        /*
         * จะมาถึงตรงนี้เฉพาะ Login สำเร็จ
         *
         * ถ้า SUSPENDED
         * AuthContext จะ throw ACCOUNT_SUSPENDED
         * ทำให้ไม่เรียก onSuccess()
         */
        if (!user) {
          return;
        }


        onSuccess?.(
          user
        );

      } catch (error) {

        /*
         * ========================================
         * SUSPENDED ACCOUNT
         * ========================================
         *
         * AuthContext แสดง popup ไปแล้ว:
         *
         * "ไม่สามารถเข้าสู่ระบบได้
         *  กรุณาติดต่อผู้ดูแลระบบ"
         *
         * ดังนั้นตรงนี้ไม่ต้องแสดงข้อความซ้ำ
         */
        if (
          error?.code ===
          'ACCOUNT_SUSPENDED'
        ) {
          return;
        }


        /*
         * Error Login ทั่วไป
         */
        setMessage(
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          'เข้าสู่ระบบไม่สำเร็จ'
        );

      } finally {
        setBusy(false);
      }
    };


  /*
   * ============================================
   * GOOGLE IDENTITY SERVICES
   * ============================================
   */

  useEffect(() => {

    if (
      useMock ||
      !clientId
    ) {
      return;
    }


    const existing =
      document.querySelector(
        'script[data-google-identity]'
      );


    const initialize =
      () => {

        if (
          !window.google ||
          !hostRef.current
        ) {
          return;
        }


        window.google
          .accounts
          .id
          .initialize({
            client_id:
              clientId,

            callback: ({
              credential,
            }) => {
              finishLogin(
                credential
              );
            },
          });


        hostRef.current
          .innerHTML = '';


        window.google
          .accounts
          .id
          .renderButton(
            hostRef.current,
            {
              theme:
                'outline',

              size:
                'large',

              width:
                320,

              text:
                'signin_with',

              shape:
                'rectangular',
            }
          );
      };


    /*
     * Script Google
     * ถูกโหลดไว้แล้ว
     */
    if (existing) {
      initialize();
      return;
    }


    /*
     * โหลด Google Identity Script
     */
    const script =
      document.createElement(
        'script'
      );


    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;
    script.defer = true;

    script.dataset
      .googleIdentity =
      'true';


    script.onload =
      initialize;


    document.head
      .appendChild(
        script
      );

  }, []);


  /*
   * ============================================
   * MOCK MODE
   * ============================================
   */

  if (useMock) {
    return (
      <>

        <Button
          className="google-login-btn"
          variant="light"
          onClick={() =>
            finishLogin()
          }
          disabled={busy}
        >

          {busy ? (
            <Spinner
              size="sm"
            />
          ) : (
            <span className="google-g">
              G
            </span>
          )}


          <span>
            เข้าสู่ระบบด้วย Google
          </span>

        </Button>


        <div className="mock-note">

          Mock mode • role:{' '}
          {import.meta.env
            .VITE_MOCK_ROLE ||
            'USER'}

        </div>


        {message && (
          <Alert
            variant="danger"
            className="mt-3 mb-0"
          >
            {message}
          </Alert>
        )}

      </>
    );
  }


  /*
   * ============================================
   * GOOGLE CLIENT ID MISSING
   * ============================================
   */

  if (!clientId) {
    return (
      <Alert variant="warning">

        กรุณาใส่
        {' '}
        VITE_GOOGLE_CLIENT_ID
        {' '}
        ในไฟล์ .env

      </Alert>
    );
  }


  /*
   * ============================================
   * REAL GOOGLE LOGIN
   * ============================================
   */

  return (
    <>

      <div
        className="google-button-host"
        ref={hostRef}
      />


      {busy && (
        <div className="text-secondary small mt-2">
          กำลังเข้าสู่ระบบ...
        </div>
      )}


      {message && (
        <Alert
          variant="danger"
          className="mt-3 mb-0"
        >
          {message}
        </Alert>
      )}

    </>
  );
}