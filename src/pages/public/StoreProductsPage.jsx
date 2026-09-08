import { FolderPlus, Heart, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import PaginationBar from '../../components/ui/PaginationBar';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/api';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

const categories = ['CPU', 'RAM', 'VGA', 'MAINBOARD', 'STORAGE', 'PSU'];

export default function StoreProductsPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 20 });
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [specs, setSpecs] = useState([]);
  const [specItem, setSpecItem] = useState(null);
  const [selectedSpecId, setSelectedSpecId] = useState('');
  const [specBusy, setSpecBusy] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, productsRes] = await Promise.all([
        store ? Promise.resolve({ data: store }) : storeService.profile(shopId),
        storeService.products(shopId, { page, limit: 20, ...(category ? { category } : {}) }),
      ]);
      setStore(profileRes.data || store);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setMeta(productsRes.meta || { page, totalPages: 1, totalItems: productsRes.data?.length || 0, limit: 20 });
      if (user?.role === 'USER') {
        try {
          const favoriteRes = await userService.favoriteProducts({ page: 1, limit: 100 });
          setFavoriteIds(new Set((favoriteRes.data || []).map((x) => Number(x.shopProductId))));
        } catch {
          // Favorite state is secondary and must not block the public product list.
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'โหลดรายการสินค้าไม่สำเร็จ'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [shopId, category, user?.role]);

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((item) => [item.customTitle, item.hardwareName, item.displayName, item.category, item.description]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword)));
  }, [products, search]);

  const toggleFavoriteProduct = async (id) => {
    if (!user) return navigate('/login', { state: { from: `/stores/${shopId}/products` } });
    if (user.role !== 'USER') {
      setError('ฟังก์ชันบันทึกสินค้าใช้สำหรับบัญชีผู้ใช้งานทั่วไป');
      return;
    }
    setBusyId(id);
    setError(''); setMessage('');
    try {
      if (favoriteIds.has(Number(id))) await userService.removeFavoriteProduct(id);
      else await userService.addFavoriteProduct(id);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(Number(id))) next.delete(Number(id)); else next.add(Number(id));
        return next;
      });
    } catch (err) {
      if (!favoriteIds.has(Number(id)) && err?.response?.status === 409) {
        setFavoriteIds((prev) => new Set([...prev, Number(id)]));
      } else setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openSpecModal = async (item) => {
    if (!user) return navigate('/login', { state: { from: `/stores/${shopId}/products` } });
    if (user.role !== 'USER') {
      setError('แฟ้มสเปคใช้สำหรับบัญชีผู้ใช้งานทั่วไป');
      return;
    }
    setError(''); setMessage(''); setSpecBusy(true);
    try {
      const response = await userService.specs({ page: 1, limit: 100 });
      const list = Array.isArray(response.data) ? response.data : [];
      setSpecs(list);
      setSelectedSpecId(list[0]?.specId ? String(list[0].specId) : '');
      setSpecItem(item);
    } catch (err) {
      setError(getApiErrorMessage(err, 'โหลดแฟ้มสเปคไม่สำเร็จ'));
    } finally {
      setSpecBusy(false);
    }
  };

  const addToSpec = async () => {
    if (!specItem || !selectedSpecId) return;
    setSpecBusy(true); setError(''); setMessage('');
    try {
      const response = await userService.addSpecItem(Number(selectedSpecId), specItem.shopProductId);
      setMessage(response.message || 'เพิ่มสินค้าลงในแฟ้มสเปคเรียบร้อยแล้ว');
      setSpecItem(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'เพิ่มสินค้าลงแฟ้มสเปคไม่สำเร็จ'));
    } finally {
      setSpecBusy(false);
    }
  };

  const initials = (store?.shopName || 'PC').slice(0, 2).toUpperCase();
  return (
    <CustomerPageFrame><div className="content-page public-content-page">
      <div className="store-hero"><div className="store-avatar large">{store?.profileImageUrl ? <img src={store.profileImageUrl} alt={store.shopName} /> : initials}</div><div><h1>{store?.shopName || 'ร้านค้า'}</h1><p>{store?.description || store?.shopDescription || 'รายการสินค้าในร้าน'}</p></div><button className="outline-btn" onClick={() => navigate(`/stores/${shopId}`)}>ดูข้อมูลร้านค้า</button></div>
      {error && <div className="inline-error">{error}</div>}{message && <div className="inline-success">{message}</div>}
      <div className="store-filters"><div className="search-control"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาในรายการหน้านี้..." /></div><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">หมวดหมู่ทั้งหมด</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select><small className="filter-hint">ช่องค้นหากรองเฉพาะรายการในหน้าปัจจุบัน</small></div>
      <div className="data-card">{loading ? <LoadingState label="กำลังโหลดสินค้า..." /> : <><table className="finder-table store-list"><thead><tr><th>#</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>ประกัน</th><th>สถานะ</th><th>บันทึก</th></tr></thead><tbody>{visibleProducts.map((item, i) => <tr key={item.shopProductId}><td>{(meta.page - 1) * (meta.limit || 20) + i + 1}</td><td><strong>{item.customTitle || item.hardwareName || item.displayName || '-'}</strong><small className="table-subtext">{item.description || ''}</small></td><td>{item.category || '-'}</td><td>{item.price != null ? `${Number(item.price).toLocaleString()}.-` : '-'}</td><td>{item.warranty || '-'}</td><td><StatusBadge status={item.productStatus || 'ACTIVE'} /></td><td><div className="product-save-actions"><button className={`icon-only ${favoriteIds.has(Number(item.shopProductId)) ? 'favorite-active' : ''}`} disabled={busyId === item.shopProductId} onClick={() => toggleFavoriteProduct(item.shopProductId)} title="บันทึกสินค้า"><Heart size={17} fill={favoriteIds.has(Number(item.shopProductId)) ? 'currentColor' : 'none'} /></button><button className="icon-only" onClick={() => openSpecModal(item)} disabled={specBusy} title="เพิ่มลงแฟ้มสเปค"><FolderPlus size={17}/></button></div></td></tr>)}</tbody></table>{!visibleProducts.length && <div className="empty-inline">ไม่พบสินค้าในเงื่อนไขนี้</div>}<div className="table-footer"><span>ทั้งหมด {meta.totalItems || products.length} รายการ</span><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load} /></div></>}</div>

      <Modal show={!!specItem} onHide={() => !specBusy && setSpecItem(null)} centered>
        <Modal.Header closeButton><Modal.Title>เพิ่มสินค้าลงแฟ้มสเปค</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="modal-product-name">{specItem?.customTitle || specItem?.hardwareName || specItem?.displayName || '-'}</p>
          {specs.length ? <Form.Group><Form.Label>เลือกแฟ้มสเปค</Form.Label><Form.Select value={selectedSpecId} onChange={(e) => setSelectedSpecId(e.target.value)}>{specs.map((spec) => <option key={spec.specId} value={spec.specId}>{spec.specName}</option>)}</Form.Select></Form.Group> : <div className="empty-inline compact-empty">ยังไม่มีแฟ้มสเปค กรุณาสร้างแฟ้มก่อน</div>}
        </Modal.Body>
        <Modal.Footer><Button variant="light" onClick={() => setSpecItem(null)} disabled={specBusy}>ยกเลิก</Button>{specs.length ? <Button onClick={addToSpec} disabled={specBusy || !selectedSpecId}>{specBusy ? 'กำลังเพิ่ม...' : 'เพิ่มลงแฟ้ม'}</Button> : <Button onClick={() => { setSpecItem(null); navigate('/specs'); }}>ไปสร้างแฟ้มสเปค</Button>}</Modal.Footer>
      </Modal>
    </div></CustomerPageFrame>
  );
}
