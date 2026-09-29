import { Edit3, Plus, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import PaginationBar from '../../components/ui/PaginationBar';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import ProductFormModal from '../../components/shop/ProductFormModal';
import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';

export default function ShopProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [prefillMasterId, setPrefillMasterId] = useState(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await shopService.products({
        page,
        limit: 20,
        ...(category ? { category } : {}),
        ...(appliedSearch ? { search: appliedSearch } : {}),
      });
      const data = response.data || {};
      const products = Array.isArray(data) ? data : (data.products || []);
      setRows(products);
      setMeta(response.meta || { page, totalPages: 1, totalItems: data.totalItems || products.length, limit: 20 });
    } catch (err) {
      setRows([]);
      setError(getApiErrorMessage(err, 'โหลดสินค้าในร้านไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [category, appliedSearch]);

  // รับ masterId จาก Gap Analysis แล้วเปิด Modal อัตโนมัติ
  useEffect(() => {
    const state = location.state || {};
    if (!state.openAddProduct || state.masterId == null) return;

    setEditItem(null);
    setPrefillMasterId(state.masterId);
    setShow(true);

    // ล้าง route state เพื่อ Refresh แล้วไม่เด้ง Modal ซ้ำ
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.state, location.pathname, location.search, navigate]);

  const openCreate = () => {
    setEditItem(null);
    setPrefillMasterId(null);
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
    setEditItem(null);
    setPrefillMasterId(null);
  };

  return <>
    <PageHeader
      title="จัดการสินค้า Hardware"
      subtitle="เพิ่ม แก้ไข ค้นหา และจัดการสินค้าของร้านคุณ"
      actions={<button type="button" className="primary-btn" onClick={openCreate}><Plus size={16}/> เพิ่มสินค้า</button>}
    />

    {error && <div className="inline-error">{error}</div>}

    <div className="toolbar-card">
      <div className="search-control"><Search size={17}/><input placeholder="ค้นหาสินค้า" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(search.trim())}/></div>
      <button className="outline-btn compact" onClick={() => setAppliedSearch(search.trim())}>ค้นหา</button>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">ทุกหมวดหมู่</option>
        <option value="CPU">CPU</option>
        <option value="MAINBOARD">Mainboard</option>
        <option value="VGA">VGA Card</option>
        <option value="RAM">RAM</option>
        <option value="STORAGE">Storage</option>
        <option value="PSU">Power Supply</option>
        <option value="COOLER">CPU Cooler</option>
      </select>
      <button className="outline-btn" onClick={() => load(meta.page || 1)}><RefreshCw size={15}/> รีเฟรช</button>
    </div>

    <div className="data-card shop-products-card">
      {loading ? <LoadingState label="กำลังโหลดสินค้า..."/> : <>
        <div className="shop-products-table-scroll">
          <table className="admin-table shop-products-table">
            <thead><tr><th>#</th><th>สินค้า</th><th>หมวดหมู่</th><th>ยี่ห้อ</th><th>ราคา (บาท)</th><th>สถานะ</th><th>อัปเดต</th><th>จัดการ</th></tr></thead>
            <tbody>{rows.map((x, i) => <tr key={x.shopProductId}>
              <td>{(meta.page - 1) * (meta.limit || 20) + i + 1}</td>
              <td className="strong-cell">{x.hardwareName || x.customTitle || x.displayName || '-'}</td>
              <td>{x.category || '-'}</td>
              <td>{x.brand || '-'}</td>
              <td className="linkish">{Number(x.price || 0).toLocaleString()}</td>
              <td><StatusBadge status={x.productStatus || x.status || 'ACTIVE'}/></td>
              <td>{x.updatedAt ? new Date(x.updatedAt).toLocaleDateString('th-TH') : '-'}</td>
              <td><div className="row-actions">
                <button
                  type="button"
                  title="แก้ไขสินค้า / เปลี่ยนสถานะ"
                  onClick={() => {
                    setPrefillMasterId(null);
                    setEditItem(x);
                    setShow(true);
                  }}
                >
                  <Edit3 size={15}/>
                </button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>

        {!rows.length && <div className="empty-inline">ยังไม่มีสินค้าในร้านตามเงื่อนไขนี้</div>}
        <div className="table-footer"><span>ทั้งหมด {meta.totalItems || rows.length} รายการ</span><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load}/></div>
      </>}
    </div>

    <ProductFormModal
      show={show}
      defaultCategory={prefillMasterId !== null ? '' : category}
      prefillMasterId={prefillMasterId}
      onHide={closeModal}
      editItem={editItem}
      onSaved={() => load(meta.page || 1)}
    />
  </>;
}
