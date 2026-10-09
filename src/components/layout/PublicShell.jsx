import {
  LogIn,
  LogOut,
  UserRound,
} from 'lucide-react';

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import Brand from './Brand';
import { useAuth } from '../../auth/AuthContext';


export default function PublicShell() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();


  const onLogout = async () => {
    await logout();

    navigate('/');
  };


  const accountPath =
    user?.role === 'SHOP'
      ? '/shop'
      : user?.role === 'ADMIN'
        ? '/admin'
        : '/specs';


  return (
    <div className="public-app">

      <header className="public-header" style={{ gridTemplateColumns: '1fr auto' }}>

        <Brand />





        <div className="public-header-actions">

          {user ? (
            <>

              <NavLink
                className="profile-chip"
                to={accountPath}
              >
                <UserRound size={16} />

                <span>
                  {user.name ||
                    user.email ||
                    'บัญชีของฉัน'}
                </span>
              </NavLink>


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

            </>
          ) : (
            <NavLink
              className="primary-btn small"
              to="/login"
            >
              <LogIn size={16} />
              เข้าสู่ระบบ
            </NavLink>
          )}

        </div>

      </header>


      <Outlet />

    </div>
  );
}