import {
  useEffect,
} from 'react';

import {
  Carousel,
  Modal,
} from 'react-bootstrap';

import {
  ArrowLeft,
  BarChart3,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Brand from '../components/layout/Brand';

import GoogleLoginButton from '../components/auth/GoogleLoginButton';

import {
  SUSPENDED_LOGIN_MESSAGE,
  useAuth,
} from '../auth/AuthContext';


const slides = [
  {
    icon: SearchCheck,

    title:
      'ค้นหาฮาร์ดแวร์ได้ง่ายขึ้น',

    text:
      'เลือก CPU, การ์ดจอ, RAM และอุปกรณ์ที่ต้องการจากฐานข้อมูลกลางในหน้าเดียว',
  },

  {
    icon: Store,

    title:
      'เปรียบเทียบร้านค้าที่ตรงสเปค',

    text:
      'ดูว่าร้านไหนมีของครบ ราคาเท่าไร และเลือกตัวเลือกที่เหมาะกับคุณ',
  },

  {
    icon: MapPin,

    title:
      'ดูร้านและตำแหน่งบนแผนที่',

    text:
      'เช็กข้อมูลร้าน ช่องทางติดต่อ ที่อยู่ และตำแหน่งก่อนตัดสินใจซื้อ',
  },
];


export default function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  const {
    user,
    loading,
    error,
    setError,
  } = useAuth();


  const from =
    location.state?.from;


  const suspendedOpen =
    error ===
    SUSPENDED_LOGIN_MESSAGE;


  /* =========================================================
     ALREADY LOGGED IN
     ========================================================= */

  useEffect(() => {
    if (
      loading ||
      !user
    ) {
      return;
    }


    if (
      user.role ===
      'ADMIN'
    ) {
      navigate(
        '/admin',
        {
          replace: true,
        }
      );

      return;
    }


    if (
      user.role ===
      'SHOP'
    ) {
      navigate(
        '/shop',
        {
          replace: true,
        }
      );

      return;
    }


    navigate(
      from || '/',
      {
        replace: true,
      }
    );

  }, [
    user,
    loading,
    from,
    navigate,
  ]);


  /* =========================================================
     LOGIN SUCCESS
     ========================================================= */

  const onSuccess =
    (loggedInUser) => {

      if (from) {
        navigate(
          from,
          {
            replace: true,
          }
        );

        return;
      }


      if (
        loggedInUser.role ===
        'ADMIN'
      ) {
        navigate(
          '/admin',
          {
            replace: true,
          }
        );

        return;
      }


      if (
        loggedInUser.role ===
        'SHOP'
      ) {
        navigate(
          '/shop',
          {
            replace: true,
          }
        );

        return;
      }


      navigate(
        '/',
        {
          replace: true,
        }
      );
    };


  const closeSuspendedModal =
    () => {
      setError('');
    };


  return (
    <>

      {/* =====================================================
          LOGIN PAGE
          ===================================================== */}

      <div className="login-page">

        {/* LEFT */}

        <div className="login-showcase">

          <div className="login-brand-row">

            <Brand />


            <Link
              to="/"
              className="back-link"
            >

              <ArrowLeft
                size={16}
              />

              กลับหน้าหลัก

            </Link>

          </div>


          <div className="showcase-copy">

            <span className="eyebrow-pill">
              ค้นหา • เปรียบเทียบ • จัดสเปค
            </span>


            <h1>
              PC FINDER ช่วยให้การเลือก
              อุปกรณ์คอมพิวเตอร์ง่ายขึ้น
            </h1>


            <p>
              ออกแบบให้ผู้ใช้ค้นหาสเปค
              เปรียบเทียบร้านค้า
              และบันทึกรายการที่สนใจได้ใน flow เดียว
            </p>

          </div>


          <Carousel
            className="feature-carousel"
            indicators
            controls={false}
            interval={4500}
          >

            {slides.map(
              ({
                icon: Icon,
                title,
                text,
              }) => (

                <Carousel.Item
                  key={title}
                >

                  <div className="feature-slide">

                    <div className="feature-visual">

                      <Icon
                        size={58}
                      />


                      <div className="visual-card one">

                        <BarChart3
                          size={18}
                        />

                        เทียบราคา

                      </div>


                      <div className="visual-card two">

                        <ShieldCheck
                          size={18}
                        />

                        ร้านที่ตรวจสอบแล้ว

                      </div>

                    </div>


                    <h3>
                      {title}
                    </h3>


                    <p>
                      {text}
                    </p>

                  </div>

                </Carousel.Item>
              )
            )}

          </Carousel>

        </div>


        {/* RIGHT */}

        <div className="login-panel">

          <div className="login-card">

            <div className="login-card-brand">
              <Brand />
            </div>


            <h2>
              เข้าสู่ระบบ
            </h2>


            <p>
              ใช้บัญชี Google เพื่อเข้าใช้งาน PC FINDER
            </p>


            <GoogleLoginButton
              onSuccess={
                onSuccess
              }
            />


            <div className="login-divider">

              <span>
                Google OAuth เท่านั้น
              </span>

            </div>


            <div className="privacy-note">

              <ShieldCheck
                size={17}
              />

              <span>
                ระบบจะใช้ข้อมูลพื้นฐานจาก Google
                สำหรับยืนยันตัวตนและสร้างบัญชีในระบบ
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SUSPENDED ACCOUNT MODAL
          ===================================================== */}

      <Modal
        show={
          suspendedOpen
        }
        onHide={
          closeSuspendedModal
        }
        centered
        backdrop="static"
        keyboard={false}
        dialogClassName="suspended-login-modal"
        backdropClassName="suspended-login-backdrop"
      >

        <div className="suspended-login-alert">

          {/* RED HEADER */}

          <div className="suspended-login-alert-top">

            <button
              type="button"
              className="suspended-login-close"
              onClick={
                closeSuspendedModal
              }
              aria-label="ปิด"
            >

              <X
                size={23}
              />

            </button>


            <div className="suspended-login-x-icon">

              <X
                size={58}
                strokeWidth={2}
              />

            </div>

          </div>


          {/* WHITE BODY */}

          <div className="suspended-login-alert-body">

            <h2>
              ไม่สามารถเข้าสู่ระบบได้
            </h2>


            <p>
              กรุณาติดต่อผู้ดูแลระบบ
            </p>


            <button
              type="button"
              className="suspended-login-ok"
              onClick={
                closeSuspendedModal
              }
            >
              ตกลง
            </button>

          </div>

        </div>

      </Modal>

    </>
  );
}