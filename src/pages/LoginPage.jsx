import { Navigate } from 'react-router-dom'
import InfoCarousel from '../components/auth/InfoCarousel.jsx'
import GoogleSignInPanel from '../components/auth/GoogleSignInPanel.jsx'
import FullPageLoader from '../components/common/FullPageLoader.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { isAuthenticated, initializing } = useAuth()
  if (initializing) return <FullPageLoader />
  if (isAuthenticated) return <Navigate to="/app" replace />

  return (
    <main className="login-page">
      <section className="login-showcase">
        <InfoCarousel />
      </section>
      <GoogleSignInPanel />
    </main>
  )
}
