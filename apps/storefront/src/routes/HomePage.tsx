import { ArrowRight, ChevronLeft, ChevronRight, Leaf, MoveRight, Recycle, Wind } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useHeroParallax, useRevealMotion, useTextParallax } from '../features/motion/useMotion'
import { formatVnd } from '../lib/format'
import { supabase } from '../lib/supabase'

const products = [
  { name: 'HORIZ Drift', note: 'Mist Grey', price: 2499000, image: '/prototype/product-drift.png' },
  { name: 'HORIZ Vale', note: 'Natural White', price: 2899000, image: '/prototype/product-vale.png' },
  { name: 'HORIZ Roam', note: 'Charcoal', price: 3199000, image: '/prototype/product-roam.png' },
  { name: 'HORIZ Tide', note: 'Soft Blue', price: 2699000, image: '/prototype/product-tide.jpg' },
]

const benefits = [
  { icon: Wind, title: 'Êm nhẹ cả ngày', copy: 'Form giày linh hoạt và đệm êm giúp bạn thoải mái từ sáng đến tối.' },
  { icon: Recycle, title: 'Dễ mang mỗi ngày', copy: 'Thiết kế tối giản, dễ phối và phù hợp với nhiều nhịp sống khác nhau.' },
  { icon: Leaf, title: 'Vật liệu có chủ đích', copy: 'Ưu tiên vật liệu tự nhiên và tái chế, lựa chọn theo công năng thực tế.' },
]

const revealDelay = (index: number) => ({ '--reveal-index': index } as CSSProperties)

export function HomePage() {
  const [heroCopy, setHeroCopy] = useState({ eyebrow: 'HORIZ / NEW SEASON', title: 'Nhẹ bước theo cách của bạn', description: 'Thiết kế linh hoạt, thoáng nhẹ cho mọi chuyển động thường ngày.' })
  const homeRef = useRef<HTMLElement>(null)
  const productTrackRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useRevealMotion(homeRef)
  useHeroParallax(homeRef)
  useTextParallax(homeRef)

  const updateProductScrollState = () => {
    const track = productTrackRef.current
    if (!track) return
    setCanScrollPrev(track.scrollLeft > 4)
    setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4)
  }

  useEffect(() => {
    updateProductScrollState()
    window.addEventListener('resize', updateProductScrollState)
    return () => window.removeEventListener('resize', updateProductScrollState)
  }, [])

  const scrollProducts = (direction: 1 | -1) => {
    const track = productTrackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.ab-product-card')
    const amount = (card?.offsetWidth ?? track.clientWidth * 0.8) + 16
    track.scrollBy({ left: amount * direction, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!supabase) return
    void supabase.from('content_sections').select('payload').eq('page_key', 'home').eq('type', 'hero').eq('active', true).order('position').limit(1).maybeSingle().then(({ data }) => {
      const payload = data?.payload
      if (!payload || Array.isArray(payload) || typeof payload !== 'object') return
      setHeroCopy((current) => ({ eyebrow: typeof payload.eyebrow === 'string' ? payload.eyebrow : current.eyebrow, title: typeof payload.title === 'string' ? payload.title : current.title, description: typeof payload.description === 'string' ? payload.description : current.description }))
    })
  }, [])

  return (
    <main id="main-content" className="ab-home" ref={homeRef}>
      <section className="ab-hero">
        <picture><source media="(max-width: 760px)" srcSet="/prototype/hero-mobile.jpg" /><img alt="HORIZ — những bước chân nhẹ cho ngày dài" fetchPriority="high" src="/prototype/hero-desktop.jpg" /></picture>
        <div className="ab-hero__shade" />
        <div className="ab-hero__content" data-reveal="hero"><p>{heroCopy.eyebrow}</p><h1>{heroCopy.title}</h1><span>{heroCopy.description}</span><div className="ab-actions"><Link className="ab-button ab-button--light" to="/women">Khám phá đồ nữ</Link><Link className="ab-button ab-button--light" to="/men">Khám phá đồ nam</Link></div></div>
      </section>
      <section className="ab-section ab-intro" data-reveal>
        <p className="ab-kicker">Vừa ra mắt</p>
        <h2>Những bước chân mới</h2>
        <p>Thoáng hơn, nhẹ hơn và sẵn sàng cho những ngày dài ngoài phố.</p>
        <div className="ab-actions">
          <Link className="ab-button ab-button--dark" to="/men">Mua đồ nam</Link>
          <Link className="ab-button ab-button--dark" to="/women">Mua đồ nữ</Link>
        </div>
      </section>

      <section aria-label="Mua theo danh mục" className="ab-category-grid">
        <Link className="ab-category-card" data-reveal style={revealDelay(0)} to="/men">
          <img alt="Bộ sưu tập giày nam HORIZ" src="/prototype/category-men.jpg" />
          <span>Giày nam <ArrowRight aria-hidden="true" /></span>
        </Link>
        <Link className="ab-category-card" data-reveal style={revealDelay(1)} to="/women">
          <img alt="Bộ sưu tập giày nữ HORIZ" src="/prototype/category-women.jpg" />
          <span>Giày nữ <ArrowRight aria-hidden="true" /></span>
        </Link>
      </section>

      <section className="ab-section ab-products">
        <div className="ab-section-heading" data-reveal>
          <div><p className="ab-kicker">Được yêu thích nhất</p><h2>Best Sellers</h2></div>
          <Link className="ab-inline-link" to="/collections/best-sellers">Xem tất cả <MoveRight aria-hidden="true" /></Link>
        </div>
        <div className="ab-product-carousel">
          <button
            aria-label="Xem sản phẩm trước"
            className="ab-carousel-nav ab-carousel-nav--prev"
            disabled={!canScrollPrev}
            onClick={() => scrollProducts(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="ab-product-grid" onScroll={updateProductScrollState} ref={productTrackRef}>
            {products.map((product, index) => (
              <article className="ab-product-card" data-reveal key={product.name} style={revealDelay(index)}>
                <Link to={`/products/${product.name.toLowerCase().replace(' ', '-')}`}>
                  <div className="ab-product-card__image">
                    <img alt={product.name} src={product.image} />
                    {index === 0 ? <span>Mới</span> : null}
                  </div>
                  <h3>{product.name}</h3><p>{product.note}</p><strong>{formatVnd(product.price)}</strong>
                </Link>
              </article>
            ))}
          </div>
          <button
            aria-label="Xem sản phẩm tiếp theo"
            className="ab-carousel-nav ab-carousel-nav--next"
            disabled={!canScrollNext}
            onClick={() => scrollProducts(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="ab-campaign">
        <div className="ab-campaign__visual" data-reveal><img alt="Dép HORIZ trên bãi cát" src="/prototype/campaign-sand.jpg" /></div>
        <div className="ab-campaign__content" data-reveal>
          <p className="ab-kicker">Summer Travel Essentials</p><h2>Đi đâu cũng nhẹ tênh</h2>
          <p>Những thiết kế dễ xỏ, dễ mang cho ngày nghỉ và mọi chuyến đi ngẫu hứng.</p>
          <div className="ab-actions"><Link className="ab-button ab-button--dark" to="/men">Mua đồ nam</Link><Link className="ab-button ab-button--dark" to="/women">Mua đồ nữ</Link></div>
        </div>
      </section>

      <section className="ab-story-grid">
        <article className="ab-story-card" data-reveal style={revealDelay(0)}>
          <img alt="Người mang giày HORIZ trong khu vườn" src="/prototype/story-garden.jpg" />
          <div><p className="ab-kicker">Màu mới mùa hè</p><h2>Tự nhiên, nhưng không mờ nhạt</h2><Link className="ab-inline-link" to="/collections/new">Khám phá bộ sưu tập <MoveRight aria-hidden="true" /></Link></div>
        </article>
        <article className="ab-story-card" data-reveal style={revealDelay(1)}>
          <img alt="Giày HORIZ trong nhịp sống thành phố" src="/prototype/story-city.jpg" />
          <div><p className="ab-kicker">Everyday comfort</p><h2>Một đôi cho cả ngày dài</h2><Link className="ab-inline-link" to="/collections/new">Xem sản phẩm mới <MoveRight aria-hidden="true" /></Link></div>
        </article>
      </section>

      <section className="ab-benefits">
        {benefits.map(({ icon: Icon, title, copy }, index) => <article data-reveal key={title} style={revealDelay(index)}><Icon aria-hidden="true" strokeWidth={0.8} /><h3>{title}</h3><p>{copy}</p></article>)}
      </section>
    </main>
  )
}
