import { ArrowRight, ChevronLeft, ChevronRight, MoveRight, Plus } from 'lucide-react'
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

const collections = [
  { label: 'Nam', href: '/men', image: '/prototype/category-men.jpg' },
  { label: 'Nữ', href: '/women', image: '/prototype/category-women.jpg' },
  { label: 'Unisex', href: '/unisex', image: '/prototype/story-city.jpg' },
]

const revealDelay = (index: number) => ({ '--reveal-index': index } as CSSProperties)

export function HomePage() {
  const [heroCopy, setHeroCopy] = useState({
    eyebrow: 'HORIZ / BỘ SƯU TẬP MỚI',
    title: 'Thiết kế vượt thời gian.',
    titleAccent: 'Nhịp sống hiện đại.',
    description: 'Những thiết kế được chăm chút cho một cuộc sống luôn chuyển động. Tinh tế một cách tự nhiên.',
  })
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
    const amount = (card?.offsetWidth ?? track.clientWidth * 0.8) + 18
    track.scrollBy({ left: amount * direction, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!supabase) return
    void supabase.from('content_sections').select('payload').eq('page_key', 'home').eq('type', 'hero').eq('active', true).order('position').limit(1).maybeSingle().then(({ data }) => {
      const payload = data?.payload
      if (!payload || Array.isArray(payload) || typeof payload !== 'object') return
      setHeroCopy((current) => ({
        eyebrow: typeof payload.eyebrow === 'string' ? payload.eyebrow : current.eyebrow,
        title: typeof payload.title === 'string' ? payload.title : current.title,
        titleAccent: typeof payload.titleAccent === 'string' ? payload.titleAccent : current.titleAccent,
        description: typeof payload.description === 'string' ? payload.description : current.description,
      }))
    })
  }, [])

  return (
    <main id="main-content" className="ab-home" ref={homeRef}>
      <section className="ab-hero">
        <picture><source media="(max-width: 760px)" srcSet="/prototype/hero-mobile.jpg" /><img alt="HORIZ — những bước chân nhẹ cho ngày dài" fetchPriority="high" src="/prototype/hero-desktop.jpg" /></picture>
        <div className="ab-hero__shade" />
        <div className="ab-hero__content" data-reveal="hero">
          <p className="ab-kicker">{heroCopy.eyebrow}</p>
          <h1>{heroCopy.title}<br /><em className="editorial">{heroCopy.titleAccent}</em></h1>
          <p>{heroCopy.description}</p>
          <div className="ab-actions">
            <Link className="button button--primary" to="/men">Mua đồ nam</Link>
            <Link className="button button--light" to="/women">Mua đồ nữ</Link>
          </div>
        </div>
      </section>

      <section className="ab-section ab-new-arrivals">
        <div className="ab-section-heading" data-reveal>
          <h2>Sản phẩm mới</h2>
          <Link className="ab-inline-link" to="/collections/new">Xem tất cả <MoveRight aria-hidden="true" /></Link>
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
                    <span aria-hidden="true" className="quick-add"><Plus /></span>
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

      <section className="ab-editorial">
        <div className="ab-editorial__inner">
          <div className="ab-editorial__visual" data-reveal>
            <img alt="Chất liệu tự nhiên của HORIZ" src="/prototype/campaign-sand.jpg" />
          </div>
          <div className="ab-editorial__content" data-reveal>
            <p className="ab-kicker">Chất liệu &amp; triết lý</p>
            <h2 className="editorial">Bắt nguồn từ tự nhiên.<br /><em>Bền bỉ theo thời gian.</em></h2>
            <p>HORIZ tạo nên những sản phẩm thiết yếu tinh tế — tập trung vào chất liệu tự nhiên, thiết kế chỉn chu và chất lượng bền lâu.</p>
            <Link className="ab-inline-link" to="/materials">Triết lý của chúng tôi <MoveRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="ab-section ab-collection">
        <div className="ab-section-heading" data-reveal>
          <h2>Khám phá bộ sưu tập</h2>
        </div>
        <div className="ab-collection-grid">
          {collections.map((collection, index) => (
            <Link className="ab-collection-card" data-reveal key={collection.href} style={revealDelay(index)} to={collection.href}>
              <img alt={`Bộ sưu tập ${collection.label} HORIZ`} src={collection.image} />
              <span>{collection.label} <ArrowRight aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ab-section ab-philosophy">
        <div className="ab-philosophy__lines" data-reveal>
          <p>Được tạo nên có chủ đích.<br />Dành cho những bước chuyển động mỗi ngày.<br />Bền bỉ vượt qua từng mùa.</p>
        </div>
      </section>
    </main>
  )
}
