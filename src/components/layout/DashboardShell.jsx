import { BarChart3, Building2, Home, LogOut, PackageSearch, Store, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../../auth/AuthContext';

const menus = {
  SHOP: [
    { to: '/shop', end: true, label: 'หน้าแรก', icon: Home },
    { to: '/shop/products', label: 'จัดการสินค้า Hardware', icon: PackageSearch },
    { to: '/shop/profile', label: 'จัดการข้อมูลร้านค้า', icon: Store },
  ],
  ADMIN: [
    { to: '/admin', end: true, label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/users', label: 'จัดการผู้ใช้', icon: UserRound },
    { to: '/admin/stores', label: 'จัดการร้านค้า', icon: Building2 },
  ],
};

export default function DashboardShell({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const shopMode = role === 'SHOP';
  const list = menus[role] || [];
  const onLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand compact />
        {shopMode && <div className="shop-mini-card"><div className="store-avatar">{(user?.name || 'SH').slice(0,2).toUpperCase()}</div><div><strong>{user?.name || 'Shop Owner'}</strong><span>Owner</span></div></div>}
        <div className="side-section-label">{shopMode ? 'เมนูร้านค้า' : 'ADMIN MENU'}</div>
        <nav className="side-menu">
          {list.map(({ to, end, label, icon: Icon }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={17} /> <span>{label}</span></NavLink>)}
        </nav>
        <button className="side-logout" onClick={onLogout}><LogOut size={17} /> ออกจากระบบ</button>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar"><div className="mobile-brand"><Brand compact /></div><div className="topbar-spacer" /><div className="topbar-user"><UserRound size={17} /><div><strong>{user?.name || (shopMode ? 'Shop Owner' : 'Admin')}</strong><span>{shopMode ? 'ร้านค้า' : 'ผู้ดูแลระบบ'}</span></div></div></header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  );
}
