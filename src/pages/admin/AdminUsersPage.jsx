import { MoreVertical, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/api';

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [nextStatus, setNextStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const response = await adminService.users({ page, limit: 20, ...(appliedSearch ? { search: appliedSearch } : {}), ...(role ? { role } : {}), ...(status ? { status } : {}) });
      setRows(Array.isArray(response.data) ? response.data : []);
      setMeta(response.meta || { page, totalPages: 1, totalItems: response.data?.length || 0 });
    } catch (err) { setRows([]); setError(getApiErrorMessage(err, 'โหลดรายชื่อผู้ใช้ไม่สำเร็จ')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(1); }, [appliedSearch, role, status]);

  const open = (user) => { setSelected(user); setNextStatus(user.userStatus || 'ACTIVE'); };
  const save = async () => {
    if (!selected) return;
    if (nextStatus === selected.userStatus) { setSelected(null); return; }
    if (!window.confirm(`ยืนยันการเปลี่ยนสถานะบัญชีเป็น ${nextStatus} หรือไม่?`)) return;
    setSaving(true); setError('');
    try { await adminService.updateUserStatus(selected.userId, nextStatus); setSelected(null); await load(meta.page || 1); }
    catch (err) { setError(getApiErrorMessage(err, 'อัปเดตสถานะผู้ใช้ไม่สำเร็จ')); }
    finally { setSaving(false); }
  };

  return <>
    <PageHeader title="จัดการผู้ใช้" subtitle="ค้นหา กรอง และจัดการสถานะบัญชีผู้ใช้"/>
    {error && <div className="inline-error">{error}</div>}
    <div className="toolbar-card"><div className="search-control"><Search size={17}/><input placeholder="ค้นหาชื่อหรืออีเมล" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(search.trim())}/></div><button className="outline-btn compact" onClick={() => setAppliedSearch(search.trim())}>ค้นหา</button><select value={role} onChange={(e) => setRole(e.target.value)}><option value="">บทบาททั้งหมด</option><option value="CUSTOMER">CUSTOMER</option><option value="shop">shop</option><option value="admin">admin</option></select><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">สถานะทั้งหมด</option><option>ACTIVE</option><option>SUSPENDED</option></select></div>
    <div className="data-card">{loading ? <LoadingState label="กำลังโหลดผู้ใช้งาน..."/> : <><table className="admin-table"><thead><tr><th>#</th><th>ผู้ใช้</th><th>อีเมล</th><th>บทบาท</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>{rows.map((u, i) => <tr key={u.userId}><td>{(meta.page - 1) * (meta.limit || 20) + i + 1}</td><td className="user-cell"><div className="tiny-avatar">{(u.displayName || u.email || '?').slice(0,1)}</div>{u.displayName || '-'}</td><td>{u.email}</td><td><span className={`role-pill role-${String(u.userRole || '').toLowerCase()}`}>{u.userRole}</span></td><td><StatusBadge status={u.userStatus}/></td><td><button className="icon-only" onClick={() => open(u)}><MoreVertical size={18}/></button></td></tr>)}</tbody></table>{!rows.length && <div className="empty-inline">ไม่พบผู้ใช้</div>}<div className="table-footer"><span>ทั้งหมด {meta.totalItems || rows.length} รายการ</span><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load}/></div></>}</div>
    <Modal show={!!selected} onHide={() => setSelected(null)} centered><Modal.Header closeButton><Modal.Title>จัดการผู้ใช้งาน</Modal.Title></Modal.Header>{selected && <Modal.Body><div className="user-modal-profile"><div className="large-generic-avatar">{(selected.displayName || selected.email).slice(0,1)}</div><div><strong>{selected.displayName}</strong><span>{selected.email}</span></div></div><Form.Group><Form.Label>สถานะบัญชี</Form.Label><Form.Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}><option>ACTIVE</option><option>SUSPENDED</option></Form.Select></Form.Group></Modal.Body>}<Modal.Footer><Button variant="light" onClick={() => setSelected(null)}>ยกเลิก</Button><Button onClick={save} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}</Button></Modal.Footer></Modal>
  </>;
}
