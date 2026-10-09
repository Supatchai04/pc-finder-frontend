import { ArrowRight, CircuitBoard, Cpu, HardDrive, MapPin, MemoryStick, Monitor, Search, Store, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomerSidebar from '../../components/navigation/CustomerSidebar';

const categories = [
  { key: 'CPU', icon: Cpu, label: 'CPU', description: 'ซีพียู' },
  { key: 'MAINBOARD', icon: CircuitBoard, label: 'Mainboard', description: 'เมนบอร์ด' },
  { key: 'VGA', icon: Monitor, label: 'VGA Card', description: 'การ์ดจอ' },
  { key: 'RAM', icon: MemoryStick, label: 'Memory', description: 'แรม' },
  { key: 'STORAGE', icon: HardDrive, label: 'Storage', description: 'อุปกรณ์จัดเก็บข้อมูล' },
  { key: 'PSU', icon: Zap, label: 'Power Supply', description: 'เพาเวอร์ซัพพลาย' },
];

const steps = [
  { icon: Search, title: 'เลือกอุปกรณ์', detail: 'ค้นหาชื่อรุ่นหรือเลือกตามหมวด แล้วเพิ่มอุปกรณ์ที่ต้องการไว้ในรายการ', tag: 'เลือกได้หลายรายการ' },
  { icon: Store, title: 'เปรียบเทียบร้าน', detail: 'ดูร้านที่มีสินค้าตรงกับรายการของคุณ พร้อมเปรียบเทียบราคาและระยะทาง', tag: 'ราคาและระยะทาง' },
  { icon: MapPin, title: 'ดูข้อมูลร้าน', detail: 'ดูรายละเอียดร้าน ตำแหน่งบนแผนที่ และช่องทางติดต่อก่อนตัดสินใจซื้อ', tag: 'ข้อมูลร้านและแผนที่' },
];

const pageStyles = `
.pcf-home .pcf-home-main { background: #f7f9fc; padding: 36px clamp(20px, 3vw, 48px) 48px; }
.pcf-home .pcf-home-content { max-width: 1240px; margin: 0 auto; }
.pcf-home .pcf-hero { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(230px, .7fr); gap: 40px; align-items: center; padding: clamp(28px, 4vw, 54px); background: #fff; border: 1px solid #e5ebf3; border-radius: 20px; }
.pcf-home .pcf-eyebrow { display: inline-flex; align-items: center; gap: 8px; color: #2876d2; font-size: 12px; font-weight: 700; letter-spacing: 1px; margin-bottom: 18px; }
.pcf-home .pcf-hero h1 { color: #19314f; font-size: clamp(28px, 3.2vw, 44px); font-weight: 700; line-height: 1.4; letter-spacing: -.7px; margin: 0 0 18px; }
.pcf-home .pcf-hero h1 span { color: #1673e6; }
.pcf-home .pcf-description { color: #66788d; font-size: 15px; line-height: 1.9; max-width: 520px; margin: 0 0 26px; }
.pcf-home .pcf-start { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 13px 20px; border-radius: 10px; background: #1673e6; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; transition: background .15s; }
.pcf-home .pcf-start:hover { background: #0c5fc5; }
.pcf-home .pcf-hero-art { display: grid; place-items: center; align-content: center; gap: 18px; min-height: 220px; border-radius: 18px; background: #f2f7ff; color: #2479dc; }
.pcf-home .pcf-art-icons { display: flex; align-items: center; gap: 12px; }
.pcf-home .pcf-art-icons > span { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 15px; background: #fff; border: 1px solid #e0ebfa; }
.pcf-home .pcf-art-icons > span:nth-child(2) { width: 82px; height: 82px; }
.pcf-home .pcf-hero-art p { color: #5e7897; font-size: 13px; margin: 0; }
.pcf-home .pcf-categories { margin-top: 32px; }
.pcf-home .pcf-section-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.pcf-home .pcf-section-heading h2 { font-size: 20px; color: #19314f; margin: 0 0 6px; font-weight: 700; }
.pcf-home .pcf-section-heading p { color: #748397; font-size: 13px; margin: 0; }
.pcf-home .pcf-all { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; font-size: 13px; color: #1673e6; text-decoration: none; }
.pcf-home .pcf-category-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.pcf-home .pcf-category { display: flex; align-items: center; gap: 13px; min-width: 0; padding: 19px 16px; background: #fff; border: 1px solid #e5ebf3; border-radius: 12px; text-decoration: none; transition: border-color .15s, background .15s; }
.pcf-home .pcf-category:hover { border-color: #97c2f4; background: #fafdff; }
.pcf-home .pcf-category-icon { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; background: #eef5ff; color: #2479dc; border-radius: 11px; }
.pcf-home .pcf-category strong { display: block; color: #26405e; font-size: 13px; font-weight: 600; }
.pcf-home .pcf-category small { display: block; margin-top: 4px; color: #78889b; font-size: 11px; }
 .pcf-home .pcf-steps { margin-top: 36px; padding-top: 30px; border-top: 1px solid #e1e8f1; }
.pcf-home .pcf-steps-heading { margin-bottom: 22px; }
.pcf-home .pcf-steps-kicker { display: block; color: #1673e6; font-size: 11px; font-weight: 700; letter-spacing: 1.3px; margin-bottom: 8px; }
.pcf-home .pcf-steps h2 { font-size: 23px; color: #26405e; margin: 0 0 8px; font-weight: 700; }
.pcf-home .pcf-steps-heading > p { color: #748397; font-size: 13px; margin: 0; line-height: 1.8; }
.pcf-home .pcf-steps ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; list-style: none; padding: 0; margin: 0; }
.pcf-home .pcf-steps li { --step-color: #2879dc; --step-soft: #edf5ff; position: relative; overflow: hidden; padding: 26px; background: #fff; border: 1px solid #e2eaf3; border-radius: 16px; box-shadow: 0 5px 18px rgba(31, 65, 110, .035); }
.pcf-home .pcf-steps li:nth-child(2) { --step-color: #148779; --step-soft: #eaf8f4; }
.pcf-home .pcf-steps li:nth-child(3) { --step-color: #8061c7; --step-soft: #f3effb; }
.pcf-home .pcf-steps li::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--step-color); }
.pcf-home .pcf-step-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.pcf-home .pcf-step-icon { width: 52px; height: 52px; display: grid; place-items: center; color: var(--step-color); background: var(--step-soft); border-radius: 14px; }
.pcf-home .pcf-step-number { color: #e4eaf2; font-size: 40px; font-weight: 700; line-height: 1; letter-spacing: -2px; }
.pcf-home .pcf-step-title { color: #26405e; font-size: 17px; font-weight: 700; margin: 0 0 10px; }
.pcf-home .pcf-step-detail { color: #748397; font-size: 13px; line-height: 1.85; margin: 0; }
.pcf-home .pcf-step-tag { display: inline-flex; align-items: center; gap: 7px; color: var(--step-color); background: var(--step-soft); border-radius: 7px; padding: 6px 10px; font-size: 11px; margin-top: 22px; }
.pcf-home a:focus-visible { outline: 3px solid #1673e6; outline-offset: 4px; }
@media (min-width: 1450px) { .pcf-home .pcf-category-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); } .pcf-home .pcf-category { flex-direction: column; align-items: flex-start; } }
@media (max-width: 1000px) { .pcf-home .pcf-hero { grid-template-columns: 1fr; } .pcf-home .pcf-hero-art { display: none; } .pcf-home .pcf-category-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 600px) { .pcf-home .pcf-home-main { padding: 20px 14px 32px; } .pcf-home .pcf-hero { padding: 26px 22px; border-radius: 14px; } .pcf-home .pcf-category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; } .pcf-home .pcf-category { padding: 14px 10px; gap: 8px; } .pcf-home .pcf-category-icon { width: 32px; height: 36px; } .pcf-home .pcf-section-heading { align-items: flex-start; flex-direction: column; gap: 10px; } .pcf-home .pcf-steps ol { grid-template-columns: 1fr; gap: 18px; } }
`;

export default function HomePage() {
  return (
    <div className="customer-layout pcf-home">
      <style>{pageStyles}</style>
      <CustomerSidebar />
      <main className="customer-main pcf-home-main">
        <div className="pcf-home-content">
          <section className="pcf-hero" aria-labelledby="pcf-home-title">
            <div>
              <span className="pcf-eyebrow"><Search size={15} aria-hidden="true" /> PC FINDER</span>
              <h1 id="pcf-home-title">ฮาร์ดแวร์ที่คุณหา<br /><span>ร้านค้าที่คุณเลือก</span></h1>
              <p className="pcf-description">เลือกอุปกรณ์ที่ต้องการ เปรียบเทียบราคาและค้นหาร้านที่มีสินค้า พร้อมดูข้อมูลร้านได้ในที่เดียว</p>
              <Link className="pcf-start" to="/hardware">เริ่มเลือกฮาร์ดแวร์ <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="pcf-hero-art" aria-hidden="true">
              <div className="pcf-art-icons"><span><Cpu size={28} /></span><span><Monitor size={42} /></span><span><MemoryStick size={28} /></span></div>
              <p>เลือกอุปกรณ์ · เปรียบเทียบร้าน · ดูตำแหน่ง</p>
            </div>
          </section>

          <section className="pcf-categories" aria-labelledby="pcf-category-title">
            <div className="pcf-section-heading">
              <div><h2 id="pcf-category-title">คุณกำลังมองหาอะไร?</h2><p>เริ่มค้นหาจากหมวดอุปกรณ์ที่ต้องการ</p></div>
              <Link className="pcf-all" to="/hardware">ดูทั้งหมด <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <div className="pcf-category-grid">
              {categories.map(({ key, icon: Icon, label, description }) => (
                <Link className="pcf-category" key={key} to={`/hardware?category=${key}`}>
                  <span className="pcf-category-icon"><Icon size={22} aria-hidden="true" /></span>
                  <div><strong>{label}</strong><small>{description}</small></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="pcf-steps" aria-labelledby="pcf-steps-title">
            <div className="pcf-steps-heading">
              <span className="pcf-steps-kicker">เริ่มต้นใช้งาน</span>
              <h2 id="pcf-steps-title">จากอุปกรณ์ที่ชอบ สู่ร้านที่ใช่</h2>
              <p>ค้นหาร้านได้ใน 3 ขั้นตอน ให้การเลือกฮาร์ดแวร์เป็นเรื่องง่ายขึ้น</p>
            </div>
            <ol>
              {steps.map(({ icon: Icon, title, detail, tag }, index) => (
                <li key={title}>
                  <div className="pcf-step-top" aria-hidden="true">
                    <span className="pcf-step-icon"><Icon size={26} /></span>
                    <span className="pcf-step-number">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="pcf-step-title">{title}</h3>
                  <p className="pcf-step-detail">{detail}</p>
                  <span className="pcf-step-tag"><ArrowRight size={13} aria-hidden="true" />{tag}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
