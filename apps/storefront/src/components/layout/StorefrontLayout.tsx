import { ChevronDown, LogOut, Menu, Search, ShieldCheck, ShoppingBag, UserRound, X } from 'lucide-react'
import { lazy, useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../features/auth/AuthProvider'
import { useCart } from '../../features/cart/CartProvider'
import { supabase } from '../../lib/supabase'
import { Wordmark } from '../brand/Wordmark'

const navItems = [
  { label: 'Nam', href: '/men' },
  { label: 'Nữ', href: '/women' },
  { label: 'Unisex', href: '/unisex' },
  { label: 'Trẻ em', href: '/toddler' },
]

const SearchOverlay = lazy(() => import('../commerce/SearchOverlay').then((module) => ({ default: module.SearchOverlay })))

const megaColumns = [
  { title: 'Mua sắm', links: [['Sản phẩm mới', '/collections/new'], ['Bán chạy', '/collections/best-sellers'], ['Giày nữ', '/women'], ['Giày nam', '/men']] },
  { title: 'Theo danh mục', links: [['Giày', '/collections/shoes'], ['Trang phục', '/collections/apparel'], ['Tất & phụ kiện', '/collections/accessories'], ['Tất cả sản phẩm', '/search']] },
  { title: 'Câu chuyện', links: [['Về HORIZ', '/about'], ['Chất liệu', '/materials'], ['Đổi trả', '/returns'], ['Trợ giúp', '/help']] },
] as const

export function StorefrontLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const location = useLocation()
  const { role, signOut, user } = useAuth()
  const { itemCount } = useCart()

  useEffect(() => {
    queueMicrotask(() => {
      setMenuOpen(false)
      setMegaOpen(false)
      setAccountOpen(false)
    })
  }, [location.pathname])

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = newsletterEmail.trim().toLowerCase()
    if (!email) return
    if (!supabase) {
      setNewsletterMessage('Chưa thể kết nối. Vui lòng thử lại sau.')
      return
    }
    const { error } = await supabase.from('newsletter_subscribers').insert({ email, status: 'pending', consented_at: new Date().toISOString() })
    const alreadySubscribed = error?.code === '23505'
    setNewsletterMessage(error && !alreadySubscribed ? 'Chưa thể đăng ký. Vui lòng thử lại.' : alreadySubscribed ? 'Email này đã đăng ký bản tin HORIZ.' : 'Đã đăng ký nhận bản tin HORIZ.')
    if (!error || alreadySubscribed) setNewsletterEmail('')
  }

  return (
    <div className="storefront-shell">
      <div className="announcement">Miễn phí giao hàng từ 1.500.000₫ · Phí tiêu chuẩn 30.000₫ · Đổi trả minh bạch</div>
      <header className="storefront-header">
        <div className="storefront-header__inner">
          <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} className="icon-button mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} type="button">
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <Wordmark />
          <nav aria-label="Điều hướng chính" className="desktop-nav">
            {navItems.map((item) => <NavLink key={item.href} to={item.href}>{item.label}</NavLink>)}
            <button aria-expanded={megaOpen} onClick={() => setMegaOpen((open) => !open)} type="button">Khám phá <ChevronDown aria-hidden="true" /></button>
          </nav>
          <div className="header-actions">
            <button aria-label="Tìm kiếm" className="icon-button" onClick={() => setSearchOpen(true)} type="button"><Search aria-hidden="true" strokeWidth={1.65} /></button>
            <div className="account-menu">
              <button aria-expanded={accountOpen} aria-label="Tài khoản" className="icon-button" onClick={() => setAccountOpen((open) => !open)} type="button"><UserRound aria-hidden="true" strokeWidth={1.65} /></button>
              {accountOpen ? (
                <div className="account-popover">
                  {user ? <><small>{user.email}</small><Link to="/account">Tài khoản của tôi</Link><Link to="/account/orders">Đơn hàng</Link>{role === 'admin' ? <Link to="/admin/dashboard">Administrator</Link> : null}<button onClick={() => void signOut()} type="button"><LogOut aria-hidden="true" /> Đăng xuất</button></> : <><strong>Thành viên HORIZ</strong><p>Theo dõi đơn hàng và lưu địa chỉ giao hàng.</p><Link className="button button--primary" to="/login">Đăng nhập</Link><Link to="/register">Tạo tài khoản</Link></>}
                </div>
              ) : null}
            </div>
            <Link aria-label={`Giỏ hàng, ${itemCount} sản phẩm`} className="icon-button bag-button" to="/cart">
              <ShoppingBag aria-hidden="true" strokeWidth={1.65} />{itemCount > 0 ? <span>{itemCount}</span> : null}
            </Link>
            {role === 'admin' ? (
              <Link aria-label="Quản trị hệ thống" className="icon-button admin-entry-button" to="/admin/dashboard">
                <ShieldCheck aria-hidden="true" strokeWidth={1.65} />
              </Link>
            ) : null}
          </div>
        </div>
        {megaOpen ? <div className="mega-menu"><div className="mega-menu__inner">{megaColumns.map((column) => <section key={column.title}><strong>{column.title}</strong>{column.links.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</section>)}<Link className="mega-menu__feature" to="/collections/new"><img alt="Bộ sưu tập HORIZ mới" src="/prototype/story-city.jpg" /><span><small>HORIZ EDIT</small><strong>Nhẹ nhàng qua từng chuyển động</strong></span></Link></div></div> : null}
        {menuOpen ? <nav aria-label="Điều hướng di động" className="mobile-nav">{navItems.map((item) => <NavLink key={item.href} to={item.href}>{item.label}</NavLink>)}<NavLink to="/search">Khám phá</NavLink><NavLink to={user ? '/account' : '/login'}>{user ? 'Tài khoản của tôi' : 'Đăng nhập'}</NavLink>{role === 'admin' ? <NavLink to="/admin/dashboard">Administrator</NavLink> : null}</nav> : null}
      </header>

      <Outlet />

      <footer className="storefront-footer">
        <section aria-labelledby="footer-newsletter-title" className="footer-newsletter">
          <div className="footer-newsletter__inner">
            <p className="eyebrow">Bản tin HORIZ</p>
            <h2 id="footer-newsletter-title">Nhận tin mới từ HORIZ</h2>
            <p className="footer-newsletter__description">Sản phẩm mới, bộ sưu tập và ưu đãi được gửi vừa đủ.</p>
            <form className="newsletter-form" onSubmit={(event) => void subscribe(event)}>
              <label className="sr-only" htmlFor="newsletter-email">Email nhận bản tin</label>
              <input id="newsletter-email" onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Email của bạn" required type="email" value={newsletterEmail} />
              <button className="button button--light" type="submit">Đăng ký</button>
            </form>
            {newsletterMessage ? <p aria-live="polite" className="newsletter-message">{newsletterMessage}</p> : null}
          </div>
        </section>
        <nav aria-label="Liên kết cuối trang" className="footer-links">
          <Wordmark />
          <div><strong>Khám phá</strong><Link to="/women">Nữ</Link><Link to="/men">Nam</Link><Link to="/materials">Chất liệu</Link><Link to="/about">Về HORIZ</Link></div>
          <div><strong>Hỗ trợ</strong><Link to="/help">Liên hệ</Link><Link to="/returns">Đổi trả</Link><Link to="/privacy">Quyền riêng tư</Link><Link to="/terms">Điều khoản</Link></div>
          <div><strong>Tài khoản</strong><Link to={user ? '/account' : '/login'}>{user ? 'Tài khoản của tôi' : 'Đăng nhập'}</Link><Link to="/register">Đăng ký thành viên</Link>{role === 'admin' ? <Link to="/admin/dashboard">Administrator</Link> : null}</div>
        </nav>
        <p className="footer-legal">© 2026 HORIZ. Thiết kế cho chuyển động tự nhiên.</p>
      </footer>
      {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} open /> : null}
    </div>
  )
}
