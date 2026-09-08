import { ArrowLeft, ExternalLink, MapPin, Phone, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/api';

export default function AdminStoreDetailPage() {
  const { shopId } = useParams();
  const [data, setData] = useState(null);
  const [nextStatus, setNextStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await adminService.store(shopId);
      setData(response.data || null);
      setNextStatus(response.data?.status?.shopStatus || response.data?.shopStatus || 'PENDING');
    } catch (err) { setError(getApiErrorMessage(err, 'โหลดรายละเอียดร้านค้าไม่สำเร็จ')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [shopId]);

  const saveStatus = async () => {
    const currentStatus = data?.status?.shopStatus || data?.shopStatus || 'PENDING';
    if (nextStatus === currentStatus) { setMessage('สถานะร้านค้าไม่มีการเปลี่ยนแปลง'); return; }
    if (!window.confirm(`ยืนยันการเปลี่ยนสถานะร้านค้าเป็น ${nextStatus} หรือไม่?`)) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await adminService.updateStoreStatus(shopId, nextStatus);
      setMessage(response.message || 'อัปเดตสถานะร้านค้าเรียบร้อยแล้ว');
      await load();
    } catch (err) { setError(getApiErrorMessage(err, 'อัปเดตสถานะร้านค้าไม่สำเร็จ')); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="กำลังโหลดรายละเอียดร้านค้า..."/>;
  const shop = data?.shop || data || {};
  const owner = data?.owner || {};
  const contact = data?.contactChannels || data?.contact || {};
  const location = data?.location || {};
  const status = data?.status || {};
  const stats = data?.statistics || {};
  const verify = data?.storeverification || {};
  return <>
    <PageHeader eyebrow="จัดการร้านค้า / รายละเอียดร้านค้า" title="รายละเอียดร้านค้า" subtitle="ข้อมูลและเอกสารสำหรับตรวจสอบคำขอร้านค้า" actions={<Link className="outline-btn" to="/admin/stores"><ArrowLeft size={16}/> กลับไปยังรายการร้านค้า</Link>}/>
    {error && <div className="inline-error">{error}</div>}{message && <div className="inline-success">{message}</div>}
    <div className="admin-detail-grid"><section className="section-card store-overview"><div className="store-avatar xl">{shop.profileImageUrl ? <img src={shop.profileImageUrl} alt={shop.shopName}/> : (shop.shopName || 'PC').slice(0,2).toUpperCase()}</div><div><h2>{shop.shopName || '-'} <StatusBadge status={status.shopStatus || shop.shopStatus}/></h2><p><UserRound size={15}/> เจ้าของร้าน: {[owner.firstName, owner.lastName].filter(Boolean).join(' ') || '-'}</p><p>✉ {owner.email || '-'}</p><p><Phone size={15}/> {owner.phone || contact.phone || '-'}</p><p>{shop.operatingHours || ''}</p></div></section><section className="section-card approval-panel"><h3>สถานะร้านค้า</h3><StatusBadge status={status.shopStatus || shop.shopStatus}/><p>ส่งคำขอ: {status.submittedAt ? new Date(status.submittedAt).toLocaleString('th-TH') : '-'}</p><p>อนุมัติโดย: {verify.approveBy || '-'}</p><label>เปลี่ยนสถานะ<select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}><option>PENDING</option><option>OPEN</option><option>CLOSED</option><option>REJECTED</option><option>SUSPENDED</option></select></label><button className="primary-btn" onClick={saveStatus} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}</button></section></div>
    <div className="admin-detail-grid"><section className="section-card"><h3>ข้อมูลร้านค้า</h3><dl className="detail-list"><dt>ชื่อร้านค้า</dt><dd>{shop.shopName || '-'}</dd><dt>คำอธิบาย</dt><dd>{shop.shopDescription || '-'}</dd><dt>Facebook</dt><dd>{contact.facebook || '-'}</dd><dt>Line</dt><dd>{contact.line || '-'}</dd><dt>Website</dt><dd>{contact.website || '-'}</dd><dt>สินค้าทั้งหมด</dt><dd>{stats.totalProducts ?? 0}</dd><dt>ยอด Favorite</dt><dd>{stats.totalFavorites ?? 0}</dd></dl><h3 className="mt-4">เอกสารประกอบ</h3><div className="document-list">{[['บัตรประชาชน', verify.idCardImage], ['หนังสือรับรองบริษัท', verify.businessRegImage], ['รูปหน้าร้าน', verify.storeImnage || verify.storeImage]].map(([label, url]) => <div key={label}><span>{label}</span>{url ? <a className="icon-only" href={url} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a> : <span>-</span>}</div>)}</div></section><section className="section-card"><h3>ที่อยู่ร้านค้า</h3><p>{[location.addressText, location.subDistrict, location.district, location.province, location.zipCode].filter(Boolean).join(' ') || '-'}</p><div className="map-placeholder admin-map"><MapPin size={44}/><strong>Google Maps</strong><span>{location.latitude ?? '-'}, {location.longitude ?? '-'}</span>{location.latitude != null && location.longitude != null && <a className="outline-btn compact" href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer">เปิดแผนที่</a>}</div></section></div>
  </>;
}
