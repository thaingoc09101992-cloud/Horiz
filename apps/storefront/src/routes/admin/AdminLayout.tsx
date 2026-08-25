import {
  BadgePercent,
  Boxes,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Wordmark } from '../../components/brand/Wordmark'
import { useAuth } from '../../features/auth/AuthProvider'

const adminNav = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Sản phẩm', href: '/admin/products', icon: PackageSearch },
  { label: 'Tồn kho', href: '/admin/inventory', icon: Boxes },
  { label: 'Giá bán', href: '/admin/pricing', icon: CircleDollarSign },
  { label: 'Chiết khấu', href: '/admin/discounts', icon: BadgePercent },
  { label: 'Đơn hàng', href: '/admin/orders', icon: ClipboardList },
  { label: 'Thành viên', href: '/admin/members', icon: UsersRound },
  { label: 'Nội dung', href: '/admin/content', icon: FileText },
  { label: 'Nhật ký', href: '/admin/audit-logs', icon: ShieldCheck },
]

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const { signOut, user } = useAuth()

  return (
    <div className="admin-shell">
      <aside className={navOpen ? 'admin-sidebar admin-sidebar--open' : 'admin-sidebar'}>
        <div className="admin-sidebar__brand">
          <Wordmark compact />
          <span>Administrator</span>
          <button aria-label="Đóng menu quản trị" className="icon-button admin-sidebar__close" onClick={() => setNavOpen(false)} type="button">
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Điều hướng quản trị" className="admin-nav">
          {adminNav.map(({ href, icon: Icon, label }) => (
            <NavLink key={href} onClick={() => setNavOpen(false)} to={href}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <NavLink to="/">
            <ChevronLeft aria-hidden="true" /> Trở về cửa hàng
          </NavLink>
          <button onClick={() => void signOut()} type="button">Đăng xuất</button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button aria-label="Mở menu quản trị" className="icon-button admin-menu-button" onClick={() => setNavOpen(true)} type="button">
            <Menu aria-hidden="true" />
          </button>
          <label className="admin-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Tìm kiếm trong trang quản trị</span>
            <input placeholder="Tìm sản phẩm, đơn hàng, thành viên…" type="search" />
          </label>
          <div className="admin-topbar__actions">
            <div className="admin-user">
              <span className="admin-user__avatar">{user?.email?.slice(0, 1).toUpperCase() ?? 'A'}</span>
              <div><strong>Admin HORIZ</strong><small>{user?.email}</small></div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
