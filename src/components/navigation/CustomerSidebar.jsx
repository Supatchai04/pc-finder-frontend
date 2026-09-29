import {
  Heart,
  Home,
  PackageSearch,
  Search,
  Store,
} from 'lucide-react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext';


const guestItems = [
  {
    to: '/',
    icon: Home,
    label: 'หน้าแรก',
  },
  {
    to: '/hardware',
    icon: Search,
    label: 'เลือกฮาร์ดแวร์',
  },
];


const userItems = [
  ...guestItems,

  {
    to: '/favorites?tab=stores',
    icon: Store,
    label: 'ร้านค้าที่บันทึกไว้',
    tab: 'stores',
  },

  {
    to: '/favorites?tab=products',
    icon: Heart,
    label: 'อุปกรณ์ที่บันทึกไว้',
    tab: 'products',
  },

  {
    to: '/shop/register',
    icon: PackageSearch,
    label: 'สมัครเปิดร้านค้า',
  },
];


export default function CustomerSidebar() {
  const { user } = useAuth();

  const location =
    useLocation();


  const items =
    user?.role === 'USER'
      ? userItems
      : guestItems;


  const currentTab =
    new URLSearchParams(
      location.search
    ).get('tab') ||
    'stores';


  const isActive = (
    item
  ) => {
    const path =
      item.to.split('?')[0];


    if (item.tab) {
      return (
        location.pathname ===
          '/favorites' &&
        currentTab ===
          item.tab
      );
    }


    if (path === '/') {
      return (
        location.pathname ===
        '/'
      );
    }


    return (
      location.pathname ===
        path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };


  return (
    <aside className="customer-sidebar">

      <div className="customer-sidebar-title">
        เมนูหลัก
      </div>


      <nav>

        {items.map(
          ({
            to,
            icon: Icon,
            label,
            ...item
          }) => (
            <Link
              key={to}
              to={to}
              className={
                isActive({
                  to,
                  ...item,
                })
                  ? 'active'
                  : ''
              }
            >
              <Icon
                size={18}
              />

              <span>
                {label}
              </span>
            </Link>
          )
        )}

      </nav>

    </aside>
  );
}