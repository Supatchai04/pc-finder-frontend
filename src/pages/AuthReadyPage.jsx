import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import { useNavigate } from 'react-router-dom'
import Brand from '../components/layout/Brand.jsx'
import AppButton from '../components/common/AppButton.jsx'
import SaveButton from '../components/common/SaveButton.jsx'
import CancelButton from '../components/common/CancelButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthReadyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="auth-ready-page">
      <header className="simple-navbar">
        <Brand />
        <AppButton variant="outline-danger" onClick={handleLogout}>ออกจากระบบ</AppButton>
      </header>

      <Container className="py-5 auth-ready-container">
        <div className="mb-4">
          <span className="section-kicker">Frontend foundation</span>
          <h1 className="mt-2">Authentication พร้อมสำหรับ Integration</h1>
          <p className="text-secondary mb-0">
            ไว้ยืนยันว่า Login, JWT state, Protected Route และ reusable components ทำงานแล้ว
            
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <Card className="soft-card h-100">
              <Card.Body className="p-4">
                <h2 className="h5 mb-3">Current User</h2>
                <div className="user-summary">
                  <img src={user?.profilePicture} alt="โปรไฟล์" />
                  <div>
                    <strong>{user?.name}</strong>
                    <div className="text-secondary">{user?.email}</div>
                    <Badge bg="primary" className="mt-2">{user?.role}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-lg-5">
            <Card className="soft-card h-100">
              <Card.Body className="p-4">
                <h2 className="h5 mb-3">Reusable Components</h2>
                <p className="text-secondary small">ตัวอย่างปุ่มที่เตรียมไว้ใช้ซ้ำในหน้าถัดไป</p>
                <div className="d-flex gap-2 flex-wrap">
                  <SaveButton />
                  <CancelButton />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
