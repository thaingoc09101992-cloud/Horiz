import {
  BadgePercent,
  Bell,
  Boxes,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Wordmark } from '../../components/brand/Wordmark'
import { useAuth } from '../../features/auth/AuthProvider'
import { supabase } from '../../lib/supabase'

const ORDERS_LAST_SEEN_KEY = 'horiz-admin-orders-last-seen:v1'
const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000

function readOrdersLastSeen(): string {
  try {
    return window.localStorage.getItem(ORDERS_LAST_SEEN_KEY) ?? new Date(Date.now() - DEFAULT_LOOKBACK_MS).toISOString()
  } catch {
    return new Date(Date.now() - DEFAULT_LOOKBACK_MS).toISOString()
  }
}

const adminNav = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Sản phẩm', href: '/admin/products', icon: PackageSearch },
  { label: 'Tồn kho', href: '/admin/inventory', icon: Boxes },
  { label: 'Giá bán', href: '/admin/pricing', icon: CircleDollarSign },
  { label: 'Chiết khấu', href: '/admin/discounts', icon: BadgePercent },
  { label: 'Đơn hàng', href: '/admin/orders', icon: ClipboardList },
  { label: 'Thành viên', href: '/admin/members', icon: UsersRound },
  { label: 'Nhật ký', href: '/admin/audit-logs', icon: ShieldCheck },
]

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const [newOrderCount, setNewOrderCount] = useState(0)
  const { signOut, user } = useAuth()

  const refreshNewOrders = useCallback(async () => {
    if (!supabase) return
    const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).gt('created_at', readOrdersLastSeen())
    setNewOrderCount(count ?? 0)
  }, [])

  useEffect(() => {
    const initial = window.setTimeout(() => void refreshNewOrders(), 0)
    const interval = window.setInterval(() => void refreshNewOrders(), 60000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [refreshNewOrders])

  const markOrdersSeen = () => {
    try {
      window.localStorage.setItem(ORDERS_LAST_SEEN_KEY, new Date().toISOString())
    } catch {
      // Notification state is best-effort; nothing to do if storage is unavailable.
    }
    setNewOrderCount(0)
  }

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
            <Link
              aria-label={newOrderCount > 0 ? `Đơn hàng mới, ${newOrderCount} đơn chưa xem` : 'Đơn hàng'}
              className="icon-button admin-bell-button"
              onClick={markOrdersSeen}
              to="/admin/orders"
            >
              <Bell aria-hidden="true" />
              {newOrderCount > 0 ? <span>{newOrderCount > 9 ? '9+' : newOrderCount}</span> : null}
            </Link>
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
