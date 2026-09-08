import { Building2, FolderOpen, PackageSearch, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import { HorizontalBars } from '../../components/charts/SimpleCharts';
import LoadingState from '../../components/ui/LoadingState';
import { adminService } from '../../services/adminService';
import { getApiErrorMessage } from '../../utils/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.dashboard().then((res) => setData(res.data || null)).catch((err) => setError(getApiErrorMessage(err, 'โหลด Admin Dashboard ไม่สำเร็จ'))).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState label="กำลังโหลด Admin Dashboard..."/>;

  const kpis = data?.kpis || {};
  const supply = data?.marketSupply || {};
  const demand = data?.customerDemand || {};
  const mostWanted = Array.isArray(demand.mostWanted) ? demand.mostWanted : [];
  const supplyByCategory = Array.isArray(supply.supplyByCategory) ? supply.supplyByCategory : [];
  const topStores = Array.isArray(demand.topFavoritedStores) ? demand.topFavoritedStores : [];
  return <>
    <PageHeader title="Dashboard" subtitle="ภาพรวมการใช้งานและสถานะของระบบ PC FINDER" />
    {error && <div className="inline-error">{error}</div>}
    <div className="stats-grid four">
      <StatCard icon={UsersRound} label="ลูกค้าทั้งหมด" value={kpis.totalCustomers?.value ?? 0} trend={kpis.totalCustomers?.trendText} tone="blue"/>
      <StatCard icon={Building2} label="ร้านค้าที่ใช้งาน" value={kpis.activeStores?.value ?? 0} trend={kpis.activeStores?.trendText} tone="green"/>
      <StatCard icon={FolderOpen} label="แฟ้มสเปคทั้งหมด" value={kpis.totalSavedBuilds?.value ?? 0} trend={kpis.totalSavedBuilds?.trendText} tone="purple"/>
      <StatCard icon={PackageSearch} label="เฉลี่ยชิ้นต่อแฟ้ม" value={kpis.avgItemsPerBuild?.value ?? 0} trend={kpis.avgItemsPerBuild?.trendText} tone="orange"/>
    </div>
    <div className="dashboard-grid equal">
      <SectionCard title="Action Center"><div className="mini-stat-row"><div><Building2/><span>ร้านรออนุมัติ</span><strong>{data?.actionCenter?.pendingStoreApprovals ?? 0}</strong></div><div><UsersRound/><span>บัญชีถูกระงับ</span><strong>{data?.actionCenter?.suspendedAccounts ?? 0}</strong></div><div><PackageSearch/><span>สินค้าพร้อมขาย</span><strong>{supply.inventoryStatus?.totalActive ?? 0}</strong></div><div><PackageSearch/><span>สินค้าหมด</span><strong>{supply.inventoryStatus?.outOfStock ?? 0}</strong></div></div></SectionCard>
      <SectionCard title="Customer Demand"><HorizontalBars labels={mostWanted.map((x) => x.category)} values={mostWanted.map((x) => x.count)}/></SectionCard>
    </div>
    <div className="dashboard-grid equal">
      <SectionCard title="Market Supply by Category"><HorizontalBars labels={supplyByCategory.map((x) => x.category)} values={supplyByCategory.map((x) => x.count)}/></SectionCard>
      <SectionCard title="สถานะคลังสินค้า"><div className="inventory-summary"><div><span>พร้อมขาย</span><strong>{Number(supply.inventoryStatus?.totalActive || 0).toLocaleString()}</strong></div><div><span>สินค้าหมด</span><strong>{Number(supply.inventoryStatus?.outOfStock || 0).toLocaleString()}</strong></div></div></SectionCard>
    </div>
    <SectionCard title="ร้านค้าที่ผู้ใช้ชื่นชอบมากที่สุด"><div className="compact-table"><table><thead><tr><th>#</th><th>ชื่อร้านค้า</th><th>พื้นที่</th><th>Favorites</th></tr></thead><tbody>{topStores.map((s) => <tr key={s.shopId}><td>{s.rank}</td><td>{s.storeName}</td><td>{s.location}</td><td>{s.favorites}</td></tr>)}</tbody></table>{!topStores.length && <div className="empty-inline">ยังไม่มีข้อมูลอันดับร้านค้า</div>}</div></SectionCard>
  </>;
}
