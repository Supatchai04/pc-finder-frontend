import { FileText, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import PageHeader from '../../components/ui/PageHeader';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/api';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

export default function SpecsPage() {
  const [specs, setSpecs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const response = await userService.specs({ page, limit: 10 });
      setSpecs(Array.isArray(response.data) ? response.data : []);
      setMeta(response.meta || { page, totalPages: 1, totalItems: response.data?.length || 0 });
    } catch (err) { setError(getApiErrorMessage(err, 'โหลดแฟ้มสเปคไม่สำเร็จ')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await userService.createSpec({ specName: name.trim(), items: [] });
      setName(''); setShowCreate(false); await load(1);
    } catch (err) { setError(getApiErrorMessage(err, 'สร้างแฟ้มสเปคไม่สำเร็จ')); }
  };

  const openDetail = async (specId) => {
    setDetailLoading(true); setSelected(null); setError('');
    try { const response = await userService.spec(specId); setSelected(response.data || null); }
    catch (err) { setError(getApiErrorMessage(err, 'โหลดรายละเอียดแฟ้มไม่สำเร็จ')); }
    finally { setDetailLoading(false); }
  };

  const deleteSpec = async (specId) => {
    if (!window.confirm('ต้องการลบแฟ้มสเปคนี้ทั้งแฟ้มหรือไม่?')) return;
    try { await userService.deleteSpec(specId); if (selected?.specId === specId) setSelected(null); await load(meta.page || 1); }
    catch (err) { setError(getApiErrorMessage(err, 'ลบแฟ้มไม่สำเร็จ')); }
  };

  const removeItem = async (specId, shopProductId) => {
    if (!window.confirm('ต้องการนำสินค้านี้ออกจากแฟ้มสเปคหรือไม่?')) return;
    try { await userService.removeSpecItem(specId, shopProductId); await openDetail(specId); }
    catch (err) { setError(getApiErrorMessage(err, 'ลบสินค้าออกจากแฟ้มไม่สำเร็จ')); }
  };

  return <CustomerPageFrame><div className="content-page public-content-page">
    <PageHeader title="แฟ้มสเปคของฉัน" subtitle="บันทึกและจัดการชุดอุปกรณ์ที่เลือกไว้" actions={<button className="primary-btn" onClick={() => setShowCreate(true)}><Plus size={16}/> สร้างแฟ้มใหม่</button>}/>
    {error && <div className="inline-error">{error}</div>}
    {loading ? <LoadingState label="กำลังโหลดแฟ้มสเปค..."/> : <><div className="spec-grid">{specs.map((s) => <article className="spec-card" key={s.specId}><div className="spec-icon"><FileText/></div><button className="icon-only danger" onClick={() => deleteSpec(s.specId)} title="ลบแฟ้ม"><Trash2 size={17}/></button><h3>{s.specName}</h3><p>{s.totalItems || 0} รายการ</p><strong>{Number(s.totalPrice || 0).toLocaleString()} บาท</strong><small>อัปเดตล่าสุด {s.updatedAt ? new Date(s.updatedAt).toLocaleString('th-TH') : '-'}</small><button className="outline-btn compact" onClick={() => openDetail(s.specId)}>ดูรายละเอียด</button></article>)}</div>{!specs.length && <div className="empty-inline">ยังไม่มีแฟ้มสเปค</div>}<div className="finder-footer"><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load}/><div className="per-page">ทั้งหมด {meta.totalItems || specs.length} แฟ้ม</div></div></>}
    {detailLoading && <LoadingState label="กำลังโหลดรายละเอียดแฟ้ม..."/>}
    {selected && <section className="section-card spec-detail"><div className="section-card-head"><div><h3>{selected.specName}</h3><p>{(selected.items || []).length} รายการ • รวม {Number(selected.totalPrice || 0).toLocaleString()} บาท</p></div><button className="icon-only" onClick={() => setSelected(null)}><X size={18}/></button></div><div className="compact-table"><table><thead><tr><th>หมวด</th><th>สินค้า</th><th>ร้าน</th><th>ราคา</th><th></th></tr></thead><tbody>{(selected.items || []).map((item) => <tr key={item.shopProductId}><td>{item.category}</td><td>{item.hardwareName}</td><td>{item.shopName}</td><td>{Number(item.price || 0).toLocaleString()}.-</td><td><button className="icon-only danger" onClick={() => removeItem(selected.specId, item.shopProductId)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></section>}
    <Modal show={showCreate} onHide={() => setShowCreate(false)} centered><Form onSubmit={create}><Modal.Header closeButton><Modal.Title>สร้างแฟ้มสเปคใหม่</Modal.Title></Modal.Header><Modal.Body><Form.Label>ชื่อแฟ้มสเปค</Form.Label><Form.Control required value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น คอมเล่นเกมงบ 30K"/></Modal.Body><Modal.Footer><Button variant="light" onClick={() => setShowCreate(false)}>ยกเลิก</Button><Button type="submit">สร้างแฟ้ม</Button></Modal.Footer></Form></Modal>
  </div></CustomerPageFrame>;
}
