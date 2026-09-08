import { Bookmark, Boxes, PackageSearch, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import LoadingState from '../../components/ui/LoadingState';
import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';

export default function ShopDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    shopService.dashboard().then((response) => setData(response.data || null)).catch((err) => setError(getApiErrorMessage(err, 'โหลด Dashboard ไม่สำเร็จ'))).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="กำลังโหลด Dashboard ร้านค้า..." />;
  const info = data?.storeInfo || {};
  const overview = data?.overview || {};
  const most = data?.mostInterestedHardware || {};
  const missing = Array.isArray(data?.missingSavedItems) ? data.missingSavedItems : [];
  return <>
    <PageHeader title={`ยินดีต้อนรับ, ${info.shopName || 'ร้านค้าของคุณ'} 👋`} subtitle={info.fullAddress || 'ภาพรวมข้อมูลร้านค้า'} />
    {error && <div className="inline-error">{error}</div>}
    <div className="stats-grid four">
      <StatCard icon={Boxes} label="สินค้าทั้งหมดในร้าน" value={overview.allGoodsInStore ?? 0} tone="blue" />
      <StatCard icon={Bookmark} label="ยอดบันทึก/ไลก์ที่ได้รับ" value={overview.likeReceivedCount ?? 0} tone="green" />
      <StatCard icon={PackageSearch} label="หมวดที่มีความสนใจ" value={Object.keys(most).length} tone="purple" />
      <StatCard icon={Store} label="รายการ Gap Analysis" value={missing.length} tone="orange" />
    </div>
    <div className="dashboard-grid equal">
      <SectionCard title="สินค้าที่ลูกค้าสนใจมากที่สุด"><div className="compact-table"><table><thead><tr><th>หมวด</th><th>สินค้า</th><th>Search Count</th></tr></thead><tbody>{Object.entries(most).map(([category, item]) => <tr key={category}><td>{category}</td><td>{item?.hardwareName || '-'}</td><td>{item?.searchCount ?? 0}</td></tr>)}</tbody></table>{!Object.keys(most).length && <div className="empty-inline">ยังไม่มีข้อมูลความสนใจ</div>}</div></SectionCard>
      <SectionCard title="Gap Analysis — ลูกค้าต้องการแต่ร้านยังไม่มี"><div className="gap-list">{missing.map((x) => <div key={x.masterId}><span><strong>{x.hardwareName}</strong><small>{x.savedCount || 0} คนบันทึกไว้</small></span><Link to="/shop/products">จัดการสินค้า</Link></div>)}{!missing.length && <div className="empty-inline">ยังไม่มี Gap ที่ต้องจัดการ</div>}</div></SectionCard>
    </div>
  </>;
}
