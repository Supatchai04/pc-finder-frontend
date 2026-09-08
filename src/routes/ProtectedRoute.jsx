import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LoadingState from '../components/ui/LoadingState';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState fullPage label="กำลังตรวจสอบการเข้าสู่ระบบ..." />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}
