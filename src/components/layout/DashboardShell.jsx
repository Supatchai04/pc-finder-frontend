import {
  Building2,
  Home,
  LogOut,
  MapPin,
  PackageSearch,
  Store,
  UserRound,
} from 'lucide-react';

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import Brand from './Brand';
import { useAuth } from '../../auth/AuthContext';


const menus = {
  SHOP: [
    {
      to: '/shop',
      end: true,
      label: 'หน้าหลัก',
      icon: Home,
    },
    {
      to: '/shop/products',
      label: 'จัดการสินค้า Hardware',
      icon: PackageSearch,
    },
    {
      to: '/shop/profile',
      label: 'จัดการข้อมูลร้านค้า',
      icon: Store,
    },
    {
      to: '/shop/location',
      label: 'จัดการตำแหน่งร้านค้า',
      icon: MapPin,
    },
  ],

  ADMIN: [
    {
      to: '/admin/users',
      label: 'จัดการผู้ใช้',
      icon: UserRound,
    },
    {
      to: '/admin/stores',
      label: 'จัดการร้านค้า',
      icon: Building2,
    },
  ],
};


export default function DashboardShell({
  role,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const shopMode =
    role === 'SHOP';

  const list =
    menus[role] || [];


  const onLogout = async () => {
    await logout();

    navigate('/');
  };


  const displayName =
    user?.name ||
    (
      shopMode
        ? 'Shop Owner'
        : 'Admin'
    );


  const roleLabel =
    shopMode
      ? 'ร้านค้า'
      : 'ผู้ดูแลระบบ';


  return (
    <div className="dashboard-shell">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <Brand compact />


        {shopMode && (
          <div className="shop-mini-card">

            <div className="store-avatar">
              {displayName
                .slice(0, 2)
                .toUpperCase()}
            </div>


            <div>
              <strong>
                {displayName}
              </strong>

              <span>
                Owner
              </span>
            </div>

          </div>
        )}


        <div className="side-section-label">
          {shopMode
            ? 'เมนูร้านค้า'
            : 'ADMIN MENU'}
        </div>


        <nav className="side-menu">

          {list.map(
            ({
              to,
              end,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({
                  isActive,
                }) =>
                  isActive
                    ? 'active'
                    : ''
                }
              >
                <Icon size={17} />

                <span>
                  {label}
                </span>

              </NavLink>
            )
          )}

        </nav>

      </aside>


      {/* MAIN */}

      <div className="dashboard-main">

        {/* TOP BAR */}

        <header className="dashboard-topbar">

          <div className="mobile-brand">
            <Brand compact />
          </div>


          <div className="topbar-spacer" />


          <div className="topbar-actions">

            <div className="topbar-user">

              <UserRound size={19} />


              <div>
                <strong>
                  {displayName}
                </strong>

                <span>
                  {roleLabel}
                </span>
              </div>

            </div>


            <button
              type="button"
              className="topbar-logout"
              onClick={onLogout}
              title="ออกจากระบบ"
            >
              <LogOut size={17} />

              <span>
                ออกจากระบบ
              </span>
            </button>

          </div>

        </header>


        <main className="dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}