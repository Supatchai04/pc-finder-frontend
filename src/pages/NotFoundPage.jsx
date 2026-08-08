import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <h1>404</h1>
      <p>ไม่พบหน้าที่ต้องการ</p>
      <Link to="/login">กลับไปหน้า Login</Link>
    </main>
  )
}
