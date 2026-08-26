import { Check, ChevronDown, Heart, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Portal } from '../components/feedback/Portal'
import products from '../data/catalogue.generated.json'
import { useAuth } from '../features/auth/AuthProvider'
import { useCart } from '../features/cart/CartProvider'
import { formatVnd } from '../lib/format'
import { getProductSizes } from '../lib/productOptions'
import { supabase } from '../lib/supabase'
import { NotFoundPage } from './NotFoundPage'

type VariantAvailability = { id: string; size: string; price: number; available: number }

function readInventory(value: unknown): { on_hand: number; reserved: number } {
  const record: unknown = Array.isArray(value) ? (value as unknown[])[0] : value
  if (!record || typeof record !== 'object') return { on_hand: 0, reserved: 0 }
  const inventory = record as Record<string, unknown>
  return {
    on_hand: typeof inventory.on_hand === 'number' ? inventory.on_hand : 0,
    reserved: typeof inventory.reserved === 'number' ? inventory.reserved : 0,
  }
}

export function ProductDetailPage() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [variants, setVariants] = useState<VariantAvailability[]>([])
  const [databaseProductId, setDatabaseProductId] = useState<string | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    if (!product || !supabase) return
    let active = true
    void supabase.from('products').select('id,description').eq('source_key', product.id).maybeSingle().then(async ({ data }) => {
      if (!active || !data) return
      setDatabaseProductId(data.id)
      const { data: rows } = await supabase!.from('product_variants').select('id,title,price_amount,inventory_items(on_hand,reserved)').eq('product_id', data.id).eq('active', true).order('title')
      if (!active) return
      setVariants((rows ?? []).map((row) => {
        const inventory = readInventory(row.inventory_items)
        return { id: row.id, size: row.title, price: row.price_amount, available: Math.max(0, inventory.on_hand - inventory.reserved) }
      }))
      if (user) {
        const { data: saved } = await supabase!.from('wishlists').select('product_id').eq('user_id', user.id).eq('product_id', data.id).maybeSingle()
        if (active) setWishlisted(Boolean(saved))
      }
    })
    return () => { active = false }
  }, [product, user])

  useEffect(() => {
    if (!product) return
    const previousTitle = document.title
    document.title = product.name + ' | HORIZ'
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content ?? ''
    if (description) description.content = product.name + ' — thiết kế HORIZ cho chuyển động tự nhiên.'
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = window.location.origin + '/products/' + product.id
    document.head.append(canonical)
    const structuredData = document.createElement('script')
    structuredData.type = 'application/ld+json'
    structuredData.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, image: product.images.map((image) => window.location.origin + image), sku: product.id, brand: { '@type': 'Brand', name: 'HORIZ' }, offers: { '@type': 'Offer', priceCurrency: 'VND', price: product.price, availability: 'https://schema.org/InStock', url: canonical.href } })
    document.head.append(structuredData)
    return () => { document.title = previousTitle; if (description) description.content = previousDescription; canonical.remove(); structuredData.remove() }
  }, [product])

  const sizes = useMemo(() => variants.length ? variants.map((variant) => variant.size) : product ? getProductSizes(product.category, product.audience) : [], [product, variants])
  const selectedVariant = variants.find((variant) => variant.size === selectedSize)
  const maxQuantity = selectedVariant ? selectedVariant.available : 99
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0
  const related = useMemo(() => product ? products.filter((item) => item.id !== product.id && item.category === product.category && item.audience === product.audience).slice(0, 4) : [], [product])

  if (!product) return <NotFoundPage />

  const handleAdd = () => {
    if (!selectedSize || maxQuantity < 1) return
    addItem({ productId: product.id, name: product.name, image: product.image, price: displayPrice, size: selectedSize, available: maxQuantity }, Math.min(quantity, maxQuantity))
    setAdded(true)
  }

  const toggleWishlist = async () => {
    if (!user) return void navigate('/login?returnTo=/products/' + product.id)
    if (!supabase || !databaseProductId) return
    if (wishlisted) await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', databaseProductId)
    else await supabase.from('wishlists').insert({ user_id: user.id, product_id: databaseProductId })
    setWishlisted((value) => !value)
  }

  return (
    <main className="pdp" id="main-content">
      <nav aria-label="Đường dẫn" className="pdp-breadcrumb"><Link to={'/' + product.audience.toLowerCase()}>{product.audience}</Link><span>/</span><span>{product.category}</span></nav>
      <div className="pdp-layout">
        <section className="pdp-gallery" aria-label="Ảnh sản phẩm">
          <div className="pdp-gallery__main"><img alt={product.name + ' — ảnh ' + String(selectedImage + 1)} src={product.images[selectedImage]} /></div>
          <div className="pdp-thumbnails">{product.images.map((image, index) => <button aria-label={'Xem ảnh ' + String(index + 1)} className={selectedImage === index ? 'active' : ''} key={image} onClick={() => setSelectedImage(index)} type="button"><img alt="" src={image} /></button>)}</div>
        </section>
        <section className="pdp-buybox">
          <div className="pdp-title-row"><div><p className="ab-kicker">{product.audience} · {product.category}</p><h1>{product.name}</h1></div><button aria-label={wishlisted ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'} className={wishlisted ? 'wishlist-button active' : 'wishlist-button'} onClick={() => void toggleWishlist()} type="button"><Heart aria-hidden="true" /></button></div>
          <p className="pdp-price">{formatVnd(displayPrice)}</p>
          <p className="pdp-intro">Thiết kế HORIZ ưu tiên cảm giác thoải mái, phom dáng linh hoạt và khả năng sử dụng hằng ngày.</p>
          <div className="pdp-size-heading"><strong>Chọn kích thước</strong><button onClick={() => setSizeGuideOpen(true)} type="button">Hướng dẫn chọn size</button></div>
          <div className="pdp-sizes">{sizes.map((size) => { const availability = variants.find((variant) => variant.size === size)?.available; const soldOut = availability === 0; return <button aria-pressed={selectedSize === size} className={selectedSize === size ? 'active' : ''} disabled={soldOut} key={size} onClick={() => { setSelectedSize(size); setQuantity(1); setAdded(false) }} title={soldOut ? 'Hết hàng' : undefined} type="button">{size}{soldOut ? <small>Hết</small> : null}</button> })}</div>
          {!selectedSize ? <p className="pdp-size-note">Vui lòng chọn kích thước trước khi thêm vào giỏ.</p> : selectedVariant ? <p className="pdp-size-note">{selectedVariant.available > 0 ? 'Còn ' + String(selectedVariant.available) + ' sản phẩm' : 'Kích thước này đã hết hàng'}</p> : null}
          <div className="pdp-quantity-row"><strong>Số lượng</strong><div className="quantity-control"><button aria-label="Giảm số lượng" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus aria-hidden="true" /></button><output aria-live="polite">{quantity}</output><button aria-label="Tăng số lượng" disabled={quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} type="button"><Plus aria-hidden="true" /></button></div></div>
          <button className="pdp-add-button" disabled={!selectedSize || maxQuantity < 1} onClick={handleAdd} type="button">{added ? <><Check aria-hidden="true" /> Đã thêm vào giỏ</> : 'Thêm vào giỏ hàng'}</button>
          <ul className="pdp-highlights"><li><Check aria-hidden="true" /> Miễn phí giao hàng cho đơn từ 1.500.000₫</li><li><Check aria-hidden="true" /> Đổi trả trong 30 ngày</li><li><Check aria-hidden="true" /> COD, thanh toán khi nhận hàng</li></ul>
          <details open><summary>Thông tin sản phẩm <ChevronDown aria-hidden="true" /></summary><p>Mã: {product.sku}<br />Danh mục: {product.category}<br />Đối tượng: {product.audience}<br />Gallery: {product.imageCount} ảnh.</p></details>
          <details><summary>Chất liệu &amp; chăm sóc <ChevronDown aria-hidden="true" /></summary><p>Vệ sinh nhẹ bằng tay, không dùng chất tẩy mạnh và để khô tự nhiên ở nơi thoáng mát.</p></details>
        </section>
      </div>
      <section className="pdp-related"><div className="ab-section-heading"><div><p className="ab-kicker">Có thể bạn sẽ thích</p><h2>Sản phẩm liên quan</h2></div></div><div className="ab-product-grid">{related.map((item) => <article className="ab-product-card" data-category={item.category} key={item.id}><Link to={'/products/' + item.id}><div className="ab-product-card__image"><img alt={item.name} loading="lazy" src={item.image} /></div><h3>{item.name}</h3><strong>{formatVnd(item.price)}</strong></Link></article>)}</div></section>
      {sizeGuideOpen ? <Portal><div aria-modal="true" className="dialog-backdrop" role="dialog"><section className="size-dialog"><button aria-label="Đóng" className="icon-button" onClick={() => setSizeGuideOpen(false)} type="button"><X aria-hidden="true" /></button><p className="ab-kicker">Hướng dẫn kích thước</p><h2>Chọn size HORIZ</h2><p>Đo chiều dài bàn chân từ gót đến đầu ngón dài nhất. Nếu nằm giữa hai size, ưu tiên size lớn hơn.</p><div className="size-table"><span>Chiều dài chân</span><strong>22–23 cm</strong><strong>23–24 cm</strong><strong>24–25 cm</strong><span>Size gợi ý</span><strong>35–36</strong><strong>37–38</strong><strong>39–40</strong></div></section></div></Portal> : null}
    </main>
  )
}
