import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '../../components/feedback/PageLoader'
import { useAuth } from './AuthProvider'

export function AccountGuard() {
  const { loading, user } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!user) return <Navigate replace to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} />
  return <Outlet />
}
