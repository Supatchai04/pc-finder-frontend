import { ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return <main className="not-found-page"><div className="not-found-card"><span>404</span><h1>ไม่พบหน้าที่ต้องการ</h1><p>URL นี้ไม่มีอยู่ใน PC FINDER หรืออาจถูกเปลี่ยนเส้นทางแล้ว</p><div><button className="outline-btn" onClick={() => navigate(-1)}><ArrowLeft size={16}/> ย้อนกลับ</button><Link className="primary-btn" to="/"><Home size={16}/> หน้าแรก</Link></div></div></main>;
}
