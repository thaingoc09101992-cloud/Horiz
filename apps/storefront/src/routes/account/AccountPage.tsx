import { Heart, MapPin, Package, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { NavLink, useLocation } from 'react-router'
import { useAuth } from '../../features/auth/AuthProvider'
import { formatVnd } from '../../lib/format'
import { supabase } from '../../lib/supabase'

type Address = { id: string; recipient: string; phone: string; line1: string; ward: string | null; district: string | null; province: string; is_default: boolean }
type Order = { id: string; order_number: string; status: string; grand_total: number; created_at: string }
type WishlistItem = { product_id: string; product: { name: string; source_key: string | null } | null }

function formText(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const accountNav = [
  { to: '/account', label: 'Tổng quan', icon: UserRound, end: true },
  { to: '/account/orders', label: 'Đơn hàng', icon: Package },
  { to: '/account/addresses', label: 'Địa chỉ', icon: MapPin },
  { to: '/account/wishlist', label: 'Yêu thích', icon: Heart },
]

export function AccountPage() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const section = pathname.split('/')[2] ?? 'overview'
  const [profile, setProfile] = useState({ full_name: '', phone: '' })
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase || !user) return
    setLoading(true)
    const [profileResult, ordersResult, addressesResult, wishlistResult] = await Promise.all([
      supabase.from('profiles').select('full_name,phone').eq('id', user.id).maybeSingle(),
      supabase.from('orders').select('id,order_number,status,grand_total,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('addresses').select('id,recipient,phone,line1,ward,district,province,is_default').eq('user_id', user.id).order('is_default', { ascending: false }),
      supabase.from('wishlists').select('product_id,product:products(name,source_key)').eq('user_id', user.id),
    ])
    if (profileResult.data) setProfile({ full_name: profileResult.data.full_name ?? '', phone: profileResult.data.phone ?? '' })
    setOrders(ordersResult.data ?? [])
    setAddresses(addressesResult.data ?? [])
    setWishlist(wishlistResult.data as unknown as WishlistItem[] ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer) }, [load])

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !user) return
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name.trim(), phone: profile.phone.trim() }).eq('id', user.id)
    setMessage(error ? 'Chưa thể cập nhật hồ sơ.' : 'Đã cập nhật hồ sơ.')
  }

  const addAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !user) return
    const data = new FormData(event.currentTarget)
    const { error } = await supabase.from('addresses').insert({ user_id: user.id, recipient: formText(data, 'recipient'), phone: formText(data, 'phone'), line1: formText(data, 'line1'), ward: formText(data, 'ward') || null, district: formText(data, 'district') || null, province: formText(data, 'province'), is_default: addresses.length === 0 })
    setMessage(error ? 'Chưa thể lưu địa chỉ.' : 'Đã thêm địa chỉ giao hàng.')
    if (!error) { event.currentTarget.reset(); await load() }
  }

  const removeAddress = async (id: string) => { if (supabase) { await supabase.from('addresses').delete().eq('id', id); await load() } }
  const removeWishlist = async (productId: string) => { if (supabase && user) { await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId); await load() } }

  return (
    <main className="account-page" id="main-content">
      <header><p className="ab-kicker">HORIZ Members</p><h1>Tài khoản của bạn</h1><p>{user?.email}</p></header>
      <div className="account-layout">
        <nav aria-label="Tài khoản">{accountNav.map(({ end, icon: Icon, label, to }) => <NavLink end={end} key={to} to={to}><Icon aria-hidden="true" />{label}</NavLink>)}</nav>
        <section className="account-content" aria-busy={loading}>
          {loading ? <p>Đang tải thông tin…</p> : null}
          {!loading && section === 'overview' ? <><div className="account-heading"><h2>Hồ sơ</h2><p>Cập nhật thông tin dùng cho đơn hàng.</p></div><form className="account-form" onSubmit={(event) => void saveProfile(event)}><label className="field"><span>Họ và tên</span><input onChange={(event) => setProfile((value) => ({ ...value, full_name: event.target.value }))} value={profile.full_name} /></label><label className="field"><span>Số điện thoại</span><input onChange={(event) => setProfile((value) => ({ ...value, phone: event.target.value }))} value={profile.phone} /></label><button className="button button--primary" type="submit">Lưu thay đổi</button></form><div className="account-summary-grid"><article><Package aria-hidden="true" /><strong>{orders.length}</strong><span>Đơn hàng</span></article><article><MapPin aria-hidden="true" /><strong>{addresses.length}</strong><span>Địa chỉ</span></article><article><Heart aria-hidden="true" /><strong>{wishlist.length}</strong><span>Yêu thích</span></article></div></> : null}
          {!loading && section === 'orders' ? <><div className="account-heading"><h2>Đơn hàng</h2><p>Theo dõi các đơn đã đặt bằng tài khoản này.</p></div>{orders.length ? <div className="account-list">{orders.map((order) => <article key={order.id}><div><strong>{order.order_number}</strong><small>{new Intl.DateTimeFormat('vi-VN').format(new Date(order.created_at))}</small></div><span className="status-badge">{order.status}</span><strong>{formatVnd(order.grand_total)}</strong></article>)}</div> : <p className="empty-copy">Bạn chưa có đơn hàng nào.</p>}</> : null}
          {!loading && section === 'addresses' ? <><div className="account-heading"><h2>Địa chỉ giao hàng</h2><p>Lưu địa chỉ để checkout nhanh hơn.</p></div><div className="address-grid">{addresses.map((address) => <article key={address.id}><strong>{address.recipient}{address.is_default ? ' · Mặc định' : ''}</strong><p>{address.phone}<br />{address.line1}, {[address.ward, address.district, address.province].filter(Boolean).join(', ')}</p><button onClick={() => void removeAddress(address.id)} type="button">Xóa</button></article>)}</div><form className="account-form account-form--address" onSubmit={(event) => void addAddress(event)}><h3>Thêm địa chỉ</h3><div className="field-row"><label className="field"><span>Người nhận</span><input name="recipient" required /></label><label className="field"><span>Số điện thoại</span><input name="phone" required /></label></div><label className="field"><span>Địa chỉ</span><input name="line1" required /></label><div className="field-row"><label className="field"><span>Phường/xã</span><input name="ward" /></label><label className="field"><span>Quận/huyện</span><input name="district" /></label><label className="field"><span>Tỉnh/thành</span><input name="province" required /></label></div><button className="button button--primary" type="submit">Lưu địa chỉ</button></form></> : null}
          {!loading && section === 'wishlist' ? <><div className="account-heading"><h2>Sản phẩm yêu thích</h2><p>Những lựa chọn bạn muốn xem lại.</p></div>{wishlist.length ? <div className="account-list">{wishlist.map((item) => <article key={item.product_id}><div><strong>{item.product?.name ?? 'Sản phẩm HORIZ'}</strong><small>Sản phẩm đã lưu</small></div><a href={`/products/${item.product?.source_key ?? ''}`}>Xem sản phẩm</a><button onClick={() => void removeWishlist(item.product_id)} type="button">Xóa</button></article>)}</div> : <p className="empty-copy">Danh sách yêu thích đang trống.</p>}</> : null}
          {message ? <p className="form-message form-message--neutral" role="status">{message}</p> : null}
        </section>
      </div>
    </main>
  )
}
