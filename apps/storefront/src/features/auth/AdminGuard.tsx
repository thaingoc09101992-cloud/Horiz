import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '../../components/feedback/PageLoader'
import { useAuth } from './AuthProvider'

export function AdminGuard() {
  const { loading, role, user } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!user) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate replace to={`/login?returnTo=${returnTo}`} />
  }

  if (role !== 'admin') {
    return (
      <main className="permission-page" id="main-content">
        <p className="eyebrow">403 · Không đủ quyền</p>
        <h1>Khu vực này dành cho quản trị viên.</h1>
        <p>Tài khoản của bạn không có quyền truy cập HORIZ Administrator.</p>
        <a className="button button--primary" href="/">
          Trở về cửa hàng
        </a>
      </main>
    )
  }

  return <Outlet />
}
