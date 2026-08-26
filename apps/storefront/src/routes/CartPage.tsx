import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { useCart } from '../features/cart/CartProvider'
import { formatVnd } from '../lib/format'

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  const freeShippingRemaining = Math.max(0, 1500000 - subtotal)

  return (
    <main className="cart-page" id="main-content">
      <header><p className="ab-kicker">HORIZ Cart</p><h1>Giỏ hàng</h1></header>
      {items.length === 0 ? (
        <section className="cart-empty"><ShoppingBag aria-hidden="true" /><h2>Giỏ hàng đang trống</h2><p>Khám phá catalogue và chọn sản phẩm phù hợp với bạn.</p><Link className="button button--primary" to="/collections/new">Tiếp tục mua sắm</Link></section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Sản phẩm trong giỏ">
            {items.map((item) => (
              <article className="cart-item" key={`${item.productId}-${item.size}`}>
                <Link to={`/products/${item.productId}`}><img alt={item.name} src={item.image} /></Link>
                <div className="cart-item__info"><Link to={`/products/${item.productId}`}><h2>{item.name}</h2></Link><p>Kích thước: {item.size}{item.available ? ` · Còn ${item.available}` : ''}</p><strong>{formatVnd(item.price)}</strong><div className="cart-quantity"><button aria-label="Giảm số lượng" onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} type="button"><Minus /></button><span>{item.quantity}</span><button aria-label="Tăng số lượng" disabled={item.quantity >= (item.available ?? 99)} onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} type="button"><Plus /></button></div></div>
                <div className="cart-item__end"><strong>{formatVnd(item.price * item.quantity)}</strong><button aria-label={`Xóa ${item.name}`} onClick={() => removeItem(item.productId, item.size)} type="button"><Trash2 /></button></div>
              </article>
            ))}
          </section>
          <aside className="cart-summary"><h2>Tóm tắt đơn hàng</h2>{freeShippingRemaining > 0 ? <p>COD MVP đang miễn phí vận chuyển cho mọi đơn hàng.</p> : <p>Bạn đã được miễn phí vận chuyển.</p>}<div><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong></div><div><span>Vận chuyển</span><strong>Miễn phí</strong></div><div className="cart-total"><span>Tổng dự kiến</span><strong>{formatVnd(subtotal)}</strong></div><Link className="pdp-add-button" to="/checkout">Đặt hàng COD</Link><p className="checkout-note">Giá và tồn kho sẽ được kiểm tra lại an toàn trong database trước khi tạo đơn.</p><Link className="cart-continue" to="/collections/new">Tiếp tục mua sắm</Link></aside>
        </div>
      )}
    </main>
  )
}
