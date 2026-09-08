import { ArrowRight, Box, CheckCircle2, CircuitBoard, Cpu, FolderHeart, HardDrive, MapPin, MemoryStick, Search, ShieldCheck, Store, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomerSidebar from '../../components/navigation/CustomerSidebar';
import { useAuth } from '../../auth/AuthContext';

const categories = [
  { key: 'CPU', icon: Cpu, label: 'CPU' },
  { key: 'MAINBOARD', icon: CircuitBoard, label: 'Mainboard' },
  { key: 'VGA', icon: Box, label: 'VGA Card' },
  { key: 'RAM', icon: MemoryStick, label: 'Memory' },
  { key: 'STORAGE', icon: HardDrive, label: 'Storage' },
  { key: 'PSU', icon: Zap, label: 'Power Supply' },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="customer-layout home-page">
      <CustomerSidebar />
      <main className="customer-main">
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-kicker">PC FINDER • Hardware Store Search</span>
            <h1>ค้นหาฮาร์ดแวร์และเปรียบเทียบร้านค้าได้ในที่เดียว</h1>
            <p>เลือกอุปกรณ์ที่ต้องการจากฐานข้อมูลกลาง แล้วให้ระบบค้นหาร้านที่มีสินค้าตรงกับรายการ พร้อมราคา ตำแหน่ง และข้อมูลร้านค้า</p>
            <div className="home-actions">
              <Link className="primary-btn" to="/hardware"><Search size={17} /> เริ่มเลือกฮาร์ดแวร์</Link>
              {user?.role === 'USER' && <Link className="outline-btn" to="/specs"><FolderHeart size={17} /> แฟ้มสเปคของฉัน</Link>}
            </div>
            <div className="home-trust-row">
              <span><CheckCircle2 size={15} /> ข้อมูลเชื่อมต่อกับระบบส่วนกลาง</span>
              <span><ShieldCheck size={15} /> เข้าสู่ระบบด้วย Google อย่างปลอดภัย</span>
            </div>
          </div>
          <div className="home-hero-visual" aria-hidden="true">
            <div className="visual-search-bar"><Search size={20} /><span>ค้นหารุ่นฮาร์ดแวร์...</span></div>
            <div className="visual-grid">
              <div><span className="visual-chip blue">CPU</span><strong>เลือกสเปค</strong><small>ค้นหาจาก Master Data</small></div>
              <div><span className="visual-chip green">STORE</span><strong>จับคู่ร้าน</strong><small>เทียบรายการและราคา</small></div>
              <div><span className="visual-chip orange">MAP</span><strong>ดูตำแหน่ง</strong><small>เช็กข้อมูลร้านก่อนซื้อ</small></div>
            </div>
            <div className="visual-flow"><span>Hardware</span><ArrowRight size={16}/><span>Matching</span><ArrowRight size={16}/><span>Store</span></div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head"><div><span>เลือกได้ตามหมวด</span><h2>เริ่มจากอุปกรณ์ที่คุณกำลังหา</h2></div><Link to="/hardware">ดูฮาร์ดแวร์ทั้งหมด <ArrowRight size={15}/></Link></div>
          <div className="home-category-grid">
            {categories.map(({ key, icon: Icon, label }) => <Link key={key} to={`/hardware?category=${key}`}><div className="category-icon"><Icon size={20}/></div><strong>{label}</strong><small>ค้นหาและเลือกอุปกรณ์</small></Link>)}
          </div>
        </section>

        <section className="home-feature-grid">
          <article><div className="feature-icon"><Search /></div><h3>ค้นหาได้เร็ว</h3><p>ค้นหาชื่อรุ่นและรับคำแนะนำจากฐานข้อมูลฮาร์ดแวร์กลาง</p></article>
          <article><div className="feature-icon"><Store /></div><h3>เปรียบเทียบร้านค้า</h3><p>จับคู่ร้านจากฮาร์ดแวร์ที่เลือก พร้อมราคาและจำนวนสินค้าที่ตรงกัน</p></article>
          <article><div className="feature-icon"><MapPin /></div><h3>ตรวจสอบร้านก่อนซื้อ</h3><p>เปิดข้อมูลร้าน ช่องทางติดต่อ ที่อยู่ และพิกัด Google Maps ได้จากหน้าร้าน</p></article>
        </section>
      </main>
    </div>
  );
}
