import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AlertMessage from '../common/AlertMessage.jsx'
import AppButton from '../common/AppButton.jsx'
import Brand from '../layout/Brand.jsx'
import GoogleIdentityButton from './GoogleIdentityButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

export default function GoogleSignInPanel() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const destination = location.state?.from?.pathname || '/app'

  const finishLogin = useCallback(async (googleToken) => {
    setLoading(true)
    setError('')
    try {
      await login(googleToken)
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }, [destination, login, navigate])

  return (
    <section className="login-panel">
      <div className="login-panel-inner">
        <Brand />
        <div className="login-heading">
          <span className="section-kicker">ยินดีต้อนรับ</span>
          <h1>เข้าสู่ระบบ</h1>
          <p>ใช้บัญชี Google เพื่อเข้าสู่ PC FINDER เท่านั้น</p>
        </div>

        <AlertMessage>{error}</AlertMessage>

        <div className="google-login-area">
          {useMock ? (
            <AppButton
              className="google-mock-button w-100"
              onClick={() => finishLogin('mock-google-id-token')}
              disabled={loading}
            >
              <span className="google-g">G</span>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
            </AppButton>
          ) : (
            <>
              <GoogleIdentityButton
                onCredential={finishLogin}
                onError={setError}
                disabled={loading}
              />
              {loading && <p className="login-loading-text">กำลังตรวจสอบบัญชีกับระบบ...</p>}
            </>
          )}
        </div>

        <div className="auth-note">
          <span className="auth-note-icon">✓</span>
          <span>Frontend เตรียม Google ID Token → JWT Access/Refresh Token ตาม API Contract แล้ว</span>
        </div>
      </div>
    </section>
  )
}
