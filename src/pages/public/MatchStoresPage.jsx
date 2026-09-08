import { ArrowLeft, MapPin, Search, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HardwareSidebar from '../../components/hardware/HardwareSidebar';
import LoadingState from '../../components/ui/LoadingState';
import { hardwareService } from '../../services/hardwareService';
import { getApiErrorMessage } from '../../utils/api';
import { buildStorage } from '../../utils/buildStorage';

const getName = (item) => item?.displayName || item?.displayname || item?.name || '-';
const getId = (item) => item?.masterId ?? item?.id;

function getLocation(timeout = 5000) {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout, maximumAge: 300000 },
    );
  });
}

export default function MatchStoresPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected] = useState(() => location.state?.selected || buildStorage.getSelected());
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('price');

  const hardwareList = useMemo(() => Object.entries(selected)
    .map(([category, items]) => {
      const list = (Array.isArray(items) ? items : [items]).filter((item) => item && getId(item) != null);
      const ids = list.map(getId);
      if (!ids.length) return null;
      return { category, masterId: ids.length === 1 ? ids[0] : ids };
    })
    .filter(Boolean), [selected]);

  const selectedItems = useMemo(() => Object.entries(selected)
    .flatMap(([category, items]) => (Array.isArray(items) ? items : [items])
      .filter((item) => item && getId(item) != null)
      .map((item) => ({ category, item }))), [selected]);

  const selectedItemCount = selectedItems.length;

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!hardwareList.length) {
        setError('ยังไม่ได้เลือกฮาร์ดแวร์ กรุณากลับไปเลือกสินค้าก่อน');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const userLocation = await getLocation();
        const payload = { hardwareList, ...(userLocation ? { userLocation } : {}) };
        const response = await hardwareService.matchStores(payload);
        if (active) setStores(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (active) setError(getApiErrorMessage(err, 'ค้นหาร้านค้าที่ตรงกับสเปคไม่สำเร็จ'));
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [hardwareList]);

  const sortedStores = useMemo(() => [...stores].sort((a, b) => (
    sort === 'distance'
      ? Number(a.distanceKm ?? Number.MAX_SAFE_INTEGER) - Number(b.distanceKm ?? Number.MAX_SAFE_INTEGER)
      : Number(a.totalPrice ?? Number.MAX_SAFE_INTEGER) - Number(b.totalPrice ?? Number.MAX_SAFE_INTEGER)
  )), [stores, sort]);

  const openSummary = (ids) => {
    buildStorage.setSummaryProductIds(ids);
    navigate('/summary', { state: { shopProductIds: ids } });
  };

  return (
    <div className="finder-layout compare-page">
      <HardwareSidebar active="" selected={selected} onSelect={(category) => navigate(`/hardware?category=${category}`)} />
      <main className="finder-main">
        <button className="back-inline-btn" onClick={() => navigate('/hardware')}><ArrowLeft size={16}/> กลับไปแก้รายการ</button>
        <div className="compare-heading"><div><h2>ร้านค้าที่ตรงกับรายการของคุณ</h2><p className="compare-subtitle">เลือกไว้ {selectedItemCount} ชิ้น จาก {hardwareList.length} หมวด ระบบจะส่งหลายรุ่นในหมวดเดียวกันไปเปรียบเทียบพร้อมกัน</p><div className="selected-summary">{selectedItems.map(({ category, item }, index) => <span key={`${category}-${getId(item)}-${index}`}><b>{category}</b>{getName(item)}</span>)}</div></div><label>เรียงลำดับ:<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="price">ราคาต่ำ - สูง</option><option value="distance">ใกล้ที่สุด</option></select></label></div>
        {loading ? <LoadingState label="กำลังจับคู่ร้านค้า..." /> : error ? <div className="empty-inline">{error}</div> : <div className="store-match-grid">
          {sortedStores.map((shop) => {
            const details = Array.isArray(shop.details) ? shop.details : [];
            const productIds = details.filter((x) => x.shopProductId).map((x) => x.shopProductId);
            const matchCount = shop.hardwareMatchCount ?? shop.matchCount ?? details.filter((x) => x.isMatched !== false && x.productStatus !== false).length;
            return <article className="match-card" key={shop.shopId}>
              <div className="match-card-head"><div className="store-icon blue">{shop.shopImageUrl ? <img src={shop.shopImageUrl} alt="" /> : <ShoppingBag size={22} />}</div><div><h3>{shop.shopName}</h3><p><MapPin size={14} /> {shop.province || '-'} {shop.district ? `• ${shop.district}` : ''} {shop.distanceKm != null ? `• ${shop.distanceKm} กม.` : ''}</p><small>ตรงกับรายการ {matchCount}/{selectedItemCount} ชิ้น</small></div></div>
              <div className="match-products">{details.map((item, index) => <div key={`${item.category}-${item.masterId}-${index}`}><span>{item.category} • {item.isMatched === false || item.productStatus === false ? 'ไม่มีสินค้า' : 'มีสินค้า'}</span><strong>{item.price != null ? `${Number(item.price).toLocaleString()}.-` : '-'}</strong></div>)}</div>
              <div className="match-total"><span>ราคารวม:</span><strong>{Number(shop.totalPrice || 0).toLocaleString()}</strong><small>บาท</small></div>
              <div className="match-card-actions"><button onClick={() => navigate(`/stores/${shop.shopId}`)}><Store size={16} /> ดูข้อมูลร้านค้า</button><button className="outline-btn compact" onClick={() => navigate(`/stores/${shop.shopId}/products`)}><ShoppingBag size={16}/> ดูสินค้า</button>{productIds.length > 0 && <button className="outline-btn compact" onClick={() => openSummary(productIds)}>สรุปรายการ</button>}</div>
            </article>;
          })}
        </div>}
        {!loading && !error && !sortedStores.length && <div className="empty-inline">ยังไม่พบร้านค้าที่ตรงกับรายการที่เลือก</div>}
        <div className="compare-note"><Search size={17} /><div><strong>หมายเหตุ</strong><p>ราคาและสถานะสินค้าอาจเปลี่ยนแปลงได้ กรุณาตรวจสอบกับร้านค้าก่อนตัดสินใจซื้อ</p></div></div>
      </main>
    </div>
  );
}
