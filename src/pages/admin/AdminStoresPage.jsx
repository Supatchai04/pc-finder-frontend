import { Building2, CheckCircle2, Eye, Search, Store, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/api';

export default function AdminStoresPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ all: 0, pending: 0, approve: 0, rejected: 0 });
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const response = await adminService.stores({ page, limit: 20, ...(appliedSearch ? { search: appliedSearch } : {}), ...(status ? { status } : {}) });
      setRows(Array.isArray(response.data) ? response.data : []);
      setSummary(response.summary || { all: response.meta?.totalItems || 0, pending: 0, approve: 0, rejected: 0 });
      setMeta(response.meta || { page, totalPages: 1, totalItems: response.data?.length || 0 });
    } catch (err) { setRows([]); setError(getApiErrorMessage(err, 'โหลดรายชื่อร้านค้าไม่สำเร็จ')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(1); }, [appliedSearch, status]);

  return <>
    <PageHeader title="จัดการร้านค้าในระบบ" subtitle="ตรวจสอบ อนุมัติ และจัดการสถานะร้านค้า"/>
    {error && <div className="inline-error">{error}</div>}
    <div className="stats-grid four"><StatCard icon={Building2} label="ร้านค้าทั้งหมด" value={summary.all || 0} tone="blue"/><StatCard icon={CheckCircle2} label="อนุมัติแล้ว" value={summary.approve || 0} tone="green"/><StatCard icon={XCircle} label="ไม่อนุมัติ" value={summary.rejected || 0} tone="red"/><StatCard icon={Store} label="คำขอรอดำเนินการ" value={summary.pending || 0} tone="orange"/></div>
    <div className="toolbar-card"><div className="search-control"><Search size={17}/><input placeholder="ค้นหาชื่อร้านหรือเจ้าของร้าน" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(search.trim())}/></div><button className="outline-btn compact" onClick={() => setAppliedSearch(search.trim())}>ค้นหา</button><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">สถานะทั้งหมด</option><option>PENDING</option><option>OPEN</option><option>CLOSED</option><option>REJECTED</option><option>SUSPENDED</option></select></div>
    <div className="data-card">{loading ? <LoadingState label="กำลังโหลดร้านค้า..."/> : <><table className="admin-table"><thead><tr><th>#</th><th>ชื่อร้านค้า</th><th>เจ้าของร้าน</th><th>อีเมล</th><th>เบอร์โทร</th><th>จังหวัด</th><th>สถานะ</th><th>วันที่สมัคร</th><th>จัดการ</th></tr></thead><tbody>{rows.map((s, i) => <tr key={s.shopId}><td>{(meta.page - 1) * (meta.limit || 20) + i + 1}</td><td className="strong-cell">{s.shopName}</td><td>{s.ownerName || '-'}</td><td>{s.ownerEmail || s.email || '-'}</td><td>{s.ownerPhone || '-'}</td><td>{s.province || '-'}</td><td><StatusBadge status={s.shopStatus}/></td><td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('th-TH') : '-'}</td><td><Link className="icon-only" to={`/admin/stores/${s.shopId}`}><Eye size={17}/></Link></td></tr>)}</tbody></table>{!rows.length && <div className="empty-inline">ไม่พบร้านค้า</div>}<div className="table-footer"><span>ทั้งหมด {meta.totalItems || rows.length} รายการ</span><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load}/></div></>}</div>
  </>;
}
