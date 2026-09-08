import { Navigate, Route, Routes } from 'react-router-dom';
import { ROLES } from './auth/roles';
import PublicShell from './components/layout/PublicShell';
import DashboardShell from './components/layout/DashboardShell';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/public/HomePage';
import HardwareFinderPage from './pages/public/HardwareFinderPage';
import HardwareDetailPage from './pages/public/HardwareDetailPage';
import MatchStoresPage from './pages/public/MatchStoresPage';
import StoreProductsPage from './pages/public/StoreProductsPage';
import StoreProfilePage from './pages/public/StoreProfilePage';
import SummaryPage from './pages/public/SummaryPage';
import FavoritesPage from './pages/user/FavoritesPage';
import SpecsPage from './pages/user/SpecsPage';
import ShopDashboardPage from './pages/shop/ShopDashboardPage';
import ShopProductsPage from './pages/shop/ShopProductsPage';
import ShopProfilePage from './pages/shop/ShopProfilePage';
import ShopRegisterPage from './pages/shop/ShopRegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminStoreDetailPage from './pages/admin/AdminStoreDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PublicShell />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="hardware" element={<HardwareFinderPage />} />
        <Route path="hardware/:category/:id" element={<HardwareDetailPage />} />
        <Route path="compare" element={<MatchStoresPage />} />
        <Route path="stores/:shopId" element={<StoreProfilePage />} />
        <Route path="stores/:shopId/products" element={<StoreProductsPage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="favorites" element={<ProtectedRoute><RoleRoute allow={[ROLES.USER]}><FavoritesPage /></RoleRoute></ProtectedRoute>} />
        <Route path="specs" element={<ProtectedRoute><RoleRoute allow={[ROLES.USER]}><SpecsPage /></RoleRoute></ProtectedRoute>} />
        <Route path="shop/register" element={<ProtectedRoute><RoleRoute allow={[ROLES.USER]}><ShopRegisterPage /></RoleRoute></ProtectedRoute>} />
      </Route>

      <Route path="/shop" element={<ProtectedRoute><RoleRoute allow={[ROLES.SHOP]}><DashboardShell role="SHOP" /></RoleRoute></ProtectedRoute>}>
        <Route index element={<ShopDashboardPage />} />
        <Route path="products" element={<ShopProductsPage />} />
        <Route path="profile" element={<ShopProfilePage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute><RoleRoute allow={[ROLES.ADMIN]}><DashboardShell role="ADMIN" /></RoleRoute></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="stores" element={<AdminStoresPage />} />
        <Route path="stores/:shopId" element={<AdminStoreDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
