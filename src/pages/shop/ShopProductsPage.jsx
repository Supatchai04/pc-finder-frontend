import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import PaginationBar from '../../components/ui/PaginationBar';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import ProductFormModal from '../../components/shop/ProductFormModal';
import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';

export default function ShopProductsPage() {
  const [show, setShow] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const response = await shopService.products({ page, limit: 20, ...(category ? { category } : {}), ...(appliedSearch ? { search: appliedSearch } : {}) });
      const data = response.data || {};
      const products = Array.isArray(data) ? data : (data.products || []);
      setRows(products);
      setMeta(response.meta || { page, totalPages: 1, totalItems: data.totalItems || products.length });
    } catch (err) { setRows([]); setError(getApiErrorMessage(err, 'โหลดสินค้าในร้านไม่สำเร็จ')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [category, appliedSearch]);

  const remove = async (id) => {
    if (!window.confirm('ต้องการลบสินค้านี้ออกจากร้านหรือไม่?')) return;
    try { await shopService.deleteProduct(id); await load(meta.page || 1); }
    catch (err) { setError(getApiErrorMessage(err, 'ลบสินค้าไม่สำเร็จ')); }
  };

  return <>
    <PageHeader title="จัดการสินค้า Hardware" subtitle="เพิ่ม แก้ไข ค้นหา และจัดการสินค้าของร้านคุณ" actions={<button className="primary-btn" onClick={() => { setEditItem(null); setShow(true); }}><Plus size={16}/> เพิ่มสินค้า</button>}/>
    {error && <div className="inline-error">{error}</div>}
    <div className="toolbar-card"><div className="search-control"><Search size={17}/><input placeholder="ค้นหาสินค้า" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(search.trim())}/></div><button className="outline-btn compact" onClick={() => setAppliedSearch(search.trim())}>ค้นหา</button><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">ทุกหมวดหมู่</option><option>CPU</option><option>VGA</option><option>RAM</option><option>STORAGE</option><option>MAINBOARD</option><option>PSU</option></select><button className="outline-btn" onClick={() => load(meta.page || 1)}><RefreshCw size={15}/> รีเฟรช</button></div>
    <div className="data-card">{loading ? <LoadingState label="กำลังโหลดสินค้า..."/> : <><table className="admin-table"><thead><tr><th>#</th><th>สินค้า</th><th>หมวดหมู่</th><th>ยี่ห้อ</th><th>ราคา (บาท)</th><th>สถานะ</th><th>อัปเดต</th><th>จัดการ</th></tr></thead><tbody>{rows.map((x, i) => <tr key={x.shopProductId}><td>{(meta.page - 1) * (meta.limit || 20) + i + 1}</td><td className="strong-cell">{x.hardwareName || x.customTitle || '-'}</td><td>{x.category || '-'}</td><td>{x.brand || '-'}</td><td className="linkish">{Number(x.price || 0).toLocaleString()}</td><td><StatusBadge status={x.productStatus || 'ACTIVE'}/></td><td>{x.updatedAt ? new Date(x.updatedAt).toLocaleDateString('th-TH') : '-'}</td><td><div className="row-actions"><button onClick={() => { setEditItem(x); setShow(true); }}><Edit3 size={15}/></button><button className="danger" onClick={() => remove(x.shopProductId)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!rows.length && <div className="empty-inline">ยังไม่มีสินค้าในร้านตามเงื่อนไขนี้</div>}<div className="table-footer"><span>ทั้งหมด {meta.totalItems || rows.length} รายการ</span><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load}/></div></>}</div>
    <ProductFormModal show={show} onHide={() => { setShow(false); setEditItem(null); }} editItem={editItem} onSaved={() => load(meta.page || 1)} />
  </>;
}
