import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../features/auth/AuthProvider'
import { useCart } from '../features/cart/CartProvider'
import { formatVnd } from '../lib/format'
import { calculateShipping } from '../lib/shipping'
import { supabase } from '../lib/supabase'

type CheckoutResult = {
  order_id: string
  order_number: string
  grand_total: number
  currency: string
  payment_method: string
}

function readCheckoutResult(value: unknown): CheckoutResult | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  return typeof record.order_id === 'string'
    && typeof record.order_number === 'string'
    && typeof record.grand_total === 'number'
    && typeof record.currency === 'string'
    && typeof record.payment_method === 'string'
    ? record as CheckoutResult
    : null
}

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const [email, setEmail] = useState(user?.email ?? '')
  const [recipient, setRecipient] = useState('')
  const [phone, setPhone] = useState('')
  const [line1, setLine1] = useState('')
  const [ward, setWard] = useState('')
  const [district, setDistrict] = useState('')
  const [province, setProvince] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CheckoutResult | null>(null)
  const [checkoutToken] = useState(() => crypto.randomUUID())
  const shippingTotal = calculateShipping(subtotal)
  const estimatedTotal = subtotal + shippingTotal

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || items.length === 0) return

    setSubmitting(true)
    setMessage(null)
    const { data, error } = await supabase.rpc('place_cod_order', {
      p_email: (user?.email ?? email).trim().toLowerCase(),
      p_phone: phone.trim(),
      p_shipping_address: {
        recipient: recipient.trim(),
        line1: line1.trim(),
        ward: ward.trim(),
        district: district.trim(),
        province: province.trim(),
      },
      p_items: items.map((item) => ({
        source_key: item.productId,
        size: item.size,
        quantity: item.quantity,
      })),
      p_checkout_token: checkoutToken,
    })
    setSubmitting(false)

    if (error) {
      setMessage(error.message || 'Chưa thể tạo đơn hàng. Vui lòng thử lại.')
      return
    }

    const checkoutResult = readCheckoutResult(data)
    if (!checkoutResult) {
      setMessage('Database đã phản hồi nhưng dữ liệu đơn hàng không hợp lệ.')
      return
    }

    clearCart()
    setResult(checkoutResult)
  }

  if (result) {
    return (
      <main className="permission-page" id="main-content">
        <p className="eyebrow">Đặt hàng thành công</p>
        <h1>{result.order_number}</h1>
        <p>Đơn COD trị giá <strong>{formatVnd(result.grand_total)}</strong> đã được ghi nhận. Bạn thanh toán khi nhận hàng.</p>
        <Link className="button button--primary" to="/">Tiếp tục mua sắm</Link>
      </main>
    )
  }

  if (items.length === 0) {
    return <main className="permission-page" id="main-content"><h1>Giỏ hàng đang trống.</h1><Link className="button button--primary" to="/cart">Quay lại giỏ hàng</Link></main>
  }

  return (
    <main className="checkout-page" id="main-content">
      <header><p className="ab-kicker">HORIZ Checkout</p><h1>Thông tin giao hàng</h1></header>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field"><span>Email nhận xác nhận đơn</span><input autoComplete="email" disabled={Boolean(user)} onChange={(event) => setEmail(event.target.value)} required type="email" value={user?.email ?? email} /></label>
          <div className="field-row">
            <label className="field"><span>Người nhận</span><input autoComplete="name" onChange={(event) => setRecipient(event.target.value)} required value={recipient} /></label>
            <label className="field"><span>Số điện thoại</span><input autoComplete="tel" minLength={8} onChange={(event) => setPhone(event.target.value)} required value={phone} /></label>
          </div>
          <label className="field"><span>Địa chỉ</span><input autoComplete="street-address" onChange={(event) => setLine1(event.target.value)} required value={line1} /></label>
          <div className="field-row">
            <label className="field"><span>Phường/xã</span><input onChange={(event) => setWard(event.target.value)} value={ward} /></label>
            <label className="field"><span>Quận/huyện</span><input onChange={(event) => setDistrict(event.target.value)} value={district} /></label>
            <label className="field"><span>Tỉnh/thành phố</span><input onChange={(event) => setProvince(event.target.value)} required value={province} /></label>
          </div>
          <section className="cod-option"><strong>Thanh toán khi nhận hàng (COD)</strong><p>{shippingTotal === 0 ? 'Đơn hàng được miễn phí vận chuyển.' : 'Phí vận chuyển tiêu chuẩn 30.000₫.'}</p></section>
          <button className="button button--primary button--wide" disabled={submitting} type="submit">{submitting ? 'Đang tạo đơn…' : `Xác nhận đặt hàng · ${formatVnd(estimatedTotal)}`}</button>
          {message ? <p className="form-message" role="alert">{message}</p> : null}
        </form>
        <aside className="cart-summary"><h2>Đơn hàng</h2>{items.map((item) => <div key={`${item.productId}-${item.size}`}><span>{item.name} · {item.size} × {item.quantity}</span><strong>{formatVnd(item.price * item.quantity)}</strong></div>)}<div><span>Vận chuyển</span><strong>{shippingTotal === 0 ? 'Miễn phí' : formatVnd(shippingTotal)}</strong></div><div className="cart-total"><span>Tổng dự kiến</span><strong>{formatVnd(estimatedTotal)}</strong></div><p>Giá và tồn kho được tính lại an toàn trên máy chủ khi xác nhận.</p></aside>
      </div>
    </main>
  )
}
