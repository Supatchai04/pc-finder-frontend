import { Heart, MapPin, PackageSearch, Store, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/api';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

export default function FavoritesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'products' ? 'products' : 'stores';
  const [tab, setTabState] = useState(initialTab);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');

  const setTab = (nextTab) => {
    setTabState(nextTab);
    setCategory('');
    const next = new URLSearchParams(searchParams);
    next.set('tab', nextTab);
    setSearchParams(next, { replace: true });
  };

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = tab === 'stores'
        ? await userService.favoriteStores({ page, limit: 20 })
        : await userService.favoriteProducts({ page, limit: 20, ...(category ? { category } : {}) });
      setRows(Array.isArray(response.data) ? response.data : []);
      setMeta(response.meta || { page, totalPages: 1, totalItems: response.data?.length || 0 });
    } catch (err) {
      setRows([]);
      setError(getApiErrorMessage(err, 'โหลดรายการที่บันทึกไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextTab = searchParams.get('tab') === 'products' ? 'products' : 'stores';
    if (nextTab !== tab) setTabState(nextTab);
  }, [searchParams]);

  useEffect(() => { load(1); }, [tab, category]);

  const remove = async (item) => {
    if (!window.confirm(`ต้องการลบ${tab === 'stores' ? 'ร้านค้า' : 'สินค้า'}นี้ออกจากรายการที่บันทึกไว้หรือไม่?`)) return;
    try {
      if (tab === 'stores') await userService.removeFavoriteStore(item.shopId);
      else await userService.removeFavoriteProduct(item.shopProductId);
      setRows((prev) => prev.filter((x) => tab === 'stores' ? x.shopId !== item.shopId : x.shopProductId !== item.shopProductId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'ลบรายการไม่สำเร็จ'));
    }
  };

  return <CustomerPageFrame><div className="content-page public-content-page">
    <PageHeader title="รายการที่บันทึกไว้" subtitle="ร้านค้าและสินค้าที่คุณสนใจและบันทึกไว้" />
    <div className="favorite-tabs"><button className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}><Store size={16}/> ร้านค้าที่ชื่นชอบ</button><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><PackageSearch size={16}/> สินค้าที่ชื่นชอบ</button></div>
    {tab === 'products' && <div className="toolbar-card compact-toolbar"><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">ทุกหมวดหมู่</option>{['CPU','RAM','VGA','MAINBOARD','STORAGE','PSU'].map((c) => <option key={c}>{c}</option>)}</select></div>}
    {error && <div className="inline-error">{error}</div>}
    {loading ? <LoadingState label="กำลังโหลดรายการที่บันทึก..." /> : <>
      <div className="favorite-grid">{rows.map((item) => tab === 'stores' ? <article className="favorite-card" key={item.shopId}><div className="favorite-icon">{item.profileImageUrl ? <img src={item.profileImageUrl} alt={item.shopName} /> : <Store/>}</div><div><h3>{item.shopName}</h3><p><MapPin size={14}/> {[item.district, item.province].filter(Boolean).join(', ') || '-'}</p><span>บันทึกเมื่อ {item.addDate || '-'}</span></div><div className="favorite-actions"><Heart fill="currentColor" size={18}/><Link to={`/stores/${item.shopId}`}>ดูร้านค้า</Link><button className="icon-only danger" onClick={() => remove(item)} title="ลบ"><Trash2 size={16}/></button></div></article> : <article className="favorite-card" key={item.shopProductId}><div className="favorite-icon">{item.profileImageUrl ? <img src={item.profileImageUrl} alt={item.shopName || 'ร้านค้า'} /> : <PackageSearch/>}</div><div><h3>{item.displayName || item.hardwareName}</h3><p>{item.category} • {item.shopName || `ร้าน #${item.shopId}`}</p><strong>{Number(item.price || 0).toLocaleString()} บาท</strong><span>{[item.district, item.province].filter(Boolean).join(', ')} • บันทึก {item.addDate || '-'}</span></div><div className="favorite-actions"><Heart fill="currentColor" size={18}/><Link to={`/stores/${item.shopId}`}>ดูร้านค้า</Link><button className="icon-only danger" onClick={() => remove(item)} title="ลบ"><Trash2 size={16}/></button></div></article>)}</div>
      {!rows.length && <div className="empty-inline">ยังไม่มี{tab === 'stores' ? 'ร้านค้า' : 'สินค้า'}ที่บันทึกไว้</div>}
      <div className="finder-footer"><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load}/><div className="per-page">ทั้งหมด {meta.totalItems || rows.length} รายการ</div></div>
    </>}
  </div></CustomerPageFrame>;
}
