import { ArrowLeft, Cpu, ImageOff, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';
import LoadingState from '../../components/ui/LoadingState';
import { hardwareService } from '../../services/hardwareService';
import { getApiErrorMessage } from '../../utils/api';

const labels = {
  family: 'Family', processorClass: 'Processor Class', processor_class: 'Processor Class', socket: 'Socket',
  ramType: 'RAM Type', capacityGB: 'Capacity', capacity_gb: 'Capacity', busSpeed: 'Bus Speed', bus_speed: 'Bus Speed',
  series: 'Series', chipset: 'Chipset', vramSize: 'VRAM', vram_size: 'VRAM',
  formFactor: 'Form Factor', serie: 'Series', storageType: 'Storage Type', interfaceType: 'Interface', interface_type: 'Interface',
  model: 'Model', watt: 'Watt', standard80Plus: '80 Plus', standard_80_plus: '80 Plus',
};

export default function HardwareDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    hardwareService.detail(category, id)
      .then((response) => active && setItem(response.data || null))
      .catch((err) => active && setError(getApiErrorMessage(err, 'โหลดรายละเอียดฮาร์ดแวร์ไม่สำเร็จ')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [category, id]);

  return <CustomerPageFrame><div className="content-page public-content-page hardware-detail-page">
    <button className="back-inline-btn" onClick={() => navigate(-1)}><ArrowLeft size={16}/> ย้อนกลับ</button>
    {loading ? <LoadingState label="กำลังโหลดรายละเอียดฮาร์ดแวร์..."/> : error || !item ? <div className="empty-inline">{error || 'ไม่พบข้อมูลฮาร์ดแวร์'}</div> : <>
      <div className="hardware-detail-hero">
        <div className="hardware-detail-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.displayName || item.name || 'Hardware'}/> : <><ImageOff size={34}/><span>ยังไม่มีรูปสินค้า</span></>}</div>
        <div className="hardware-detail-copy"><span className="hardware-category-pill">{item.category || category}</span><h1>{item.displayName || item.displayname || item.name || '-'}</h1><p className="hardware-brand"><Cpu size={16}/> {item.brand || '-'}</p><div className="hardware-detail-actions"><Link className="primary-btn" to={`/hardware?category=${String(category).toUpperCase()}`}><Search size={16}/> เลือกอุปกรณ์หมวดนี้</Link></div></div>
      </div>
      <section className="section-card hardware-spec-card"><h3>รายละเอียดสเปค</h3><div className="hardware-spec-grid">{Object.entries(item.specs || {}).map(([key, value]) => <div key={key}><span>{labels[key] || key}</span><strong>{String(value ?? '-')}</strong></div>)}</div>{!Object.keys(item.specs || {}).length && <div className="empty-inline">ยังไม่มีรายละเอียดสเปคเพิ่มเติม</div>}</section>
    </>}
  </div></CustomerPageFrame>;
}
