import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LoadingState from '../components/ui/LoadingState';

export default function RoleRoute({ allow, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState fullPage label="กำลังตรวจสอบสิทธิ์..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
