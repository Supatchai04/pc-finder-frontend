import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RoleRoute({ allow = [] }) {
  const { user } = useAuth()
  const role = user?.role?.toUpperCase()
  if (!allow.map((item) => item.toUpperCase()).includes(role)) {
    return <Navigate to="/app" replace />
  }
  return <Outlet />
}
