import { ChevronDown, LogOut, Menu, Search, ShieldCheck, ShoppingBag, UserRound, X } from 'lucide-react'
import { lazy, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../features/auth/AuthProvider'
import { useCart } from '../../features/cart/CartProvider'
import { useDelayedUnmount } from '../../features/motion/useMotion'
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
  { title: 'Câu chuyện', links: [['Về chúng tôi', '/about'], ['Chất liệu', '/materials'], ['Đổi trả', '/returns'], ['Trợ giúp', '/help']] },
] as const

export function StorefrontLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { role, signOut, user } = useAuth()
  const { itemCount } = useCart()
  const megaMounted = useDelayedUnmount(megaOpen)
  const menuMounted = useDelayedUnmount(menuOpen)
  const accountMounted = useDelayedUnmount(accountOpen)

  useEffect(() => {
    queueMicrotask(() => {
      setMenuOpen(false)
      setMegaOpen(false)
      setAccountOpen(false)
    })
  }, [location.pathname])

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 4)
    updateScrolled()
    window.addEventListener('scroll', updateScrolled, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolled)
  }, [])

  useEffect(() => {
    if (!megaOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node
      if (navRef.current?.contains(target) || megaMenuRef.current?.contains(target)) return
      setMegaOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [megaOpen])

  useEffect(() => {
    if (!accountOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (accountMenuRef.current?.contains(event.target as Node)) return
      setAccountOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [accountOpen])

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
      <header className={`storefront-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="storefront-header__inner">
          <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} className="icon-button mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} type="button">
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <Wordmark />
          <nav aria-label="Điều hướng chính" className="desktop-nav" ref={navRef}>
            {navItems.map((item) => <NavLink key={item.href} to={item.href}>{item.label}</NavLink>)}
            <button aria-expanded={megaOpen} onClick={() => setMegaOpen((open) => !open)} type="button">Khám phá <ChevronDown aria-hidden="true" /></button>
          </nav>
          <div className="header-actions">
            <button aria-label="Tìm kiếm" className="icon-button" onClick={() => setSearchOpen(true)} type="button"><Search aria-hidden="true" strokeWidth={1.65} /></button>
            <div className="account-menu" ref={accountMenuRef}>
              <button aria-expanded={accountOpen} aria-label="Tài khoản" className="icon-button" onClick={() => setAccountOpen((open) => !open)} type="button"><UserRound aria-hidden="true" strokeWidth={1.65} /></button>
              {accountMounted ? (
                <div aria-hidden={!accountOpen} className={`account-popover ${accountOpen ? 'is-open' : 'is-closing'}`} inert={!accountOpen}>
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
        {megaMounted ? <div aria-hidden={!megaOpen} className={`mega-menu ${megaOpen ? 'is-open' : 'is-closing'}`} inert={!megaOpen} ref={megaMenuRef}><div className="mega-menu__inner">{megaColumns.map((column) => <section key={column.title}><strong>{column.title}</strong>{column.links.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</section>)}<Link className="mega-menu__feature" to="/collections/new"><img alt="Bộ sưu tập HORIZ mới" src="/prototype/story-city.jpg" /><span><small>HORIZ EDIT</small><strong>Nhẹ nhàng qua từng chuyển động</strong></span></Link></div></div> : null}
        {menuMounted ? <nav aria-hidden={!menuOpen} aria-label="Điều hướng di động" className={`mobile-nav ${menuOpen ? 'is-open' : 'is-closing'}`} inert={!menuOpen}>{navItems.map((item) => <NavLink key={item.href} to={item.href}>{item.label}</NavLink>)}<NavLink to="/search">Khám phá</NavLink><NavLink to={user ? '/account' : '/login'}>{user ? 'Tài khoản của tôi' : 'Đăng nhập'}</NavLink>{role === 'admin' ? <NavLink to="/admin/dashboard">Administrator</NavLink> : null}</nav> : null}
      </header>

      <div className="page-stage" key={location.pathname}><Outlet /></div>

      <footer className="storefront-footer">
        <div className="footer-main">
          <section aria-label="Đăng ký nhận bản tin" className="footer-newsletter">
            <Wordmark />
            <p className="footer-newsletter__description">Nhận thông tin mới nhất</p>
            <form className="newsletter-form" onSubmit={(event) => void subscribe(event)}>
              <label className="sr-only" htmlFor="newsletter-email">Email nhận bản tin</label>
              <input id="newsletter-email" onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Email của bạn" required type="email" value={newsletterEmail} />
              <button className="button button--light" type="submit">Đăng ký</button>
            </form>
            {newsletterMessage ? <p aria-live="polite" className="newsletter-message">{newsletterMessage}</p> : null}
          </section>
          <nav aria-label="Liên kết cuối trang" className="footer-links">
            <div><strong>Về HORIZ</strong><Link to="/about">Câu chuyện</Link><Link to="/materials">Chất liệu</Link></div>
            <div><strong>Chăm sóc khách hàng</strong><Link to="/help">Liên hệ</Link><Link to="/returns">Đổi trả</Link><Link to="/privacy">Quyền riêng tư</Link><Link to="/terms">Điều khoản</Link><Link to={user ? '/account' : '/login'}>{user ? 'Tài khoản của tôi' : 'Đăng nhập'}</Link>{user ? null : <Link to="/register">Đăng ký thành viên</Link>}{role === 'admin' ? <Link to="/admin/dashboard">Administrator</Link> : null}</div>
          </nav>
          <section aria-label="Địa chỉ cửa hàng" className="footer-contact">
            <strong>Ghé thăm HORIZ</strong>
            <address>227 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh</address>
            <div className="footer-contact__map">
              <iframe
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.638321103379!2d106.67861047560994!3d10.762332559452357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c1a72871d%3A0x7300e8391d075756!2zMjI3IE5ndXnhu4VuIFbEg24gQ-G7qywgQ2jhu6MgUXXDoW4sIEjhu5MgQ2jDrSBNaW5oIDcwMDAwMCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1788664556472!5m2!1svi!2s"
                title="Bản đồ đường tới HORIZ, 227 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh"
              />
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=227%20Nguy%E1%BB%85n%20V%C4%83n%20C%E1%BB%AB%20Ph%C6%B0%E1%BB%9Dng%20Ch%E1%BB%A3%20Qu%C3%A1n" rel="noreferrer" target="_blank">Xem chỉ đường</a>
          </section>
        </div>
        {/* Dòng ghi công tác giả phải được giữ nguyên — xem tệp LICENSE ở gốc repo. */}
        <p className="footer-legal"><span>© 2026 HORIZ. Thiết kế cho chuyển động tự nhiên.</span><span>Website được thiết kế bởi Dương Thái Ngọc.</span></p>
      </footer>
      <SearchOverlay onClose={() => setSearchOpen(false)} open={searchOpen} />
    </div>
  )
}
