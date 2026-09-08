import { Clock3, Facebook, Heart, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import LoadingState from '../../components/ui/LoadingState';
import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/api';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

export default function StoreProfilePage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const profile = await storeService.profile(shopId);
        if (!active) return;
        setStore(profile.data || null);
        if (user?.role === 'USER') {
          try {
            const favorites = await userService.favoriteStores({ page: 1, limit: 100 });
            if (active) setFavorite((favorites.data || []).some((item) => Number(item.shopId) === Number(shopId)));
          } catch {
            // Favorite state is secondary; profile must remain usable if this call fails.
          }
        }
      } catch (err) {
        if (active) setError(getApiErrorMessage(err, 'โหลดข้อมูลร้านค้าไม่สำเร็จ'));
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [shopId, user?.role]);

  const toggleFavorite = async () => {
    if (!user) return navigate('/login', { state: { from: `/stores/${shopId}` } });
    if (user.role !== 'USER') {
      setError('ฟังก์ชันบันทึกร้านค้าใช้สำหรับบัญชีผู้ใช้งานทั่วไป');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (favorite) await userService.removeFavoriteStore(Number(shopId));
      else await userService.addFavoriteStore(Number(shopId));
      setFavorite((value) => !value);
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (!favorite && err?.response?.status === 409) setFavorite(true);
      else setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CustomerPageFrame><div className="content-page public-content-page"><LoadingState label="กำลังโหลดข้อมูลร้านค้า..." /></div></CustomerPageFrame>;
  if (!store) return <CustomerPageFrame><div className="content-page public-content-page"><div className="empty-inline">{error || 'ไม่พบข้อมูลร้านค้า'}</div></div></CustomerPageFrame>;

  const contact = store.contactChannels || store.contact || {};
  const hasStructuredContact = Boolean(contact.phone || contact.lineId || contact.line || contact.facebook);
  const initials = (store.shopName || 'PC').slice(0, 2).toUpperCase();
  return (
    <CustomerPageFrame><div className="content-page public-content-page">
      <div className="breadcrumb-line"><button onClick={() => navigate(-1)}>ย้อนกลับ</button><span>/</span><span>ข้อมูลร้านค้า</span></div>
      {error && <div className="inline-error">{error}</div>}
      <div className="store-hero"><div className="store-avatar large">{store.profileImageUrl ? <img src={store.profileImageUrl} alt={store.shopName} /> : initials}</div><div><h1>{store.shopName}</h1><p>{store.description || store.shopDescription || 'ร้านจำหน่ายอุปกรณ์คอมพิวเตอร์'}</p></div><button className={`outline-btn ${favorite ? 'favorite-active' : ''}`} onClick={toggleFavorite} disabled={busy}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /> {busy ? 'กำลังบันทึก...' : favorite ? 'บันทึกแล้ว' : 'บันทึกร้านนี้'}</button></div>
      <div className="profile-map-grid">
        <section className="contact-panel"><h3>รายละเอียดร้านค้า</h3><div><Clock3 /> <span>เวลาทำการ<strong>{store.operatingHours || '-'}</strong></span></div>{hasStructuredContact ? <><div><Phone /> <span>เบอร์ติดต่อ<strong>{contact.phone || store.ownerPhone || '-'}</strong></span></div><div><span className="line-icon">L</span><span>Line<strong>{contact.lineId || contact.line || '-'}</strong></span></div><div><Facebook /> <span>Facebook<strong>{contact.facebook || '-'}</strong></span></div></> : <div><Phone /><span>ข้อมูลติดต่อ<strong>{store.contactInfo || store.ownerPhone || '-'}</strong></span></div>}</section>
        <div className="map-placeholder"><MapPin size={48} /><strong>ตำแหน่งร้านค้า</strong><span>{store.latitude ?? '-'}, {store.longitude ?? '-'}</span>{store.latitude != null && store.longitude != null && <a className="outline-btn compact" href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`} target="_blank" rel="noreferrer">เปิด Google Maps</a>}</div>
      </div>
      <section className="address-card"><MapPin size={22} /><div><h3>ที่อยู่ร้านค้า</h3><p>{store.fullAddress || '-'}</p></div></section>
      <div className="center-action"><button className="primary-btn" onClick={() => navigate(`/stores/${shopId}/products`)}><ShoppingBag size={17} /> ดูสินค้าทั้งหมดของร้าน</button></div>
    </div></CustomerPageFrame>
  );
}
