import { ArrowRight, ChevronLeft, ChevronRight, MoveRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import catalogue from '../data/catalogue.generated.json'
import { useHeroParallax, useRevealMotion, useTextParallax } from '../features/motion/useMotion'
import { formatVnd } from '../lib/format'
import { supabase } from '../lib/supabase'

// A curated pick of real catalogue products — using catalogue ids (rather than
// hand-written demo data) keeps every card linking to a product page that
// actually exists.
const newArrivalIds = [
  'men-shoes-mens-cruiser-natural-white',
  'women-shoes-womens-breezer-point-warm-white',
  'men-shoes-mens-couriers-dark-grey-natural-black',
  'unisex-shoes-mens-cruiser-shadow-blue-natural-white-sole',
]
const products = newArrivalIds
  .map((id) => catalogue.find((product) => product.id === id))
  .filter((product): product is (typeof catalogue)[number] => Boolean(product))

const collections = [
  { label: 'Nam', href: '/men', image: '/prototype/category-men.jpg' },
  { label: 'Nữ', href: '/women', image: '/prototype/category-women.jpg' },
  { label: 'Unisex', href: '/unisex', image: '/prototype/story-city.jpg' },
]

// Hero slideshow — slide 0 keeps the original (CMS-overridable) copy; slides 1–2
// carry their own copy around HORIZ's other two pillars: natural materials and
// all-day comfort. Auto-advances every 3s (paused for reduced-motion users).
const HERO_SLIDE_INTERVAL_MS = 3000
const heroSlides = [
  {
    image: '/prototype/hero-1.png',
    alt: 'HORIZ — thiết kế vượt thời gian cho nhịp sống hiện đại',
    eyebrow: 'HORIZ / BỘ SƯU TẬP MỚI',
    title: 'Thiết kế vượt thời gian.',
    titleAccent: 'Nhịp sống hiện đại.',
    description: 'Những thiết kế được chăm chút cho một cuộc sống luôn chuyển động. Tinh tế một cách tự nhiên.',
  },
  {
    image: '/prototype/hero-2.png',
    alt: 'HORIZ — chất liệu tự nhiên có nguồn gốc rõ ràng',
    eyebrow: 'HORIZ / CHẤT LIỆU TỰ NHIÊN',
    title: 'Chạm vào thiên nhiên.',
    titleAccent: 'Bền bỉ mỗi ngày.',
    description: 'Sợi tự nhiên có nguồn gốc rõ ràng, xử lý tối giản để giữ trọn sự thoáng nhẹ và độ bền theo năm tháng.',
  },
  {
    image: '/prototype/hero-3.png',
    alt: 'HORIZ — form dáng ôm chân, đế êm cho cả ngày dài',
    eyebrow: 'HORIZ / THOẢI MÁI CẢ NGÀY',
    title: 'Nhẹ như không mang.',
    titleAccent: 'Đi hết ngày dài.',
    description: 'Form dáng ôm chân, đế êm nâng niu từng bước — đồng hành từ sáng sớm đến tối muộn mà không mỏi.',
  },
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
  const [activeHeroSlide, setActiveHeroSlide] = useState(0)

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

  // Auto-advance the hero slideshow. The slide/copy transitions are opacity-only
  // and are already reduced to instant swaps for prefers-reduced-motion users by
  // the global motion rule, so the rotation itself can stay on for everyone.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length)
    }, HERO_SLIDE_INTERVAL_MS)
    return () => window.clearTimeout(timeoutId)
  }, [activeHeroSlide])

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

  const heroContent = activeHeroSlide === 0 ? heroCopy : heroSlides[activeHeroSlide] ?? heroCopy

  return (
    <main id="main-content" className="ab-home" ref={homeRef}>
      <section className="ab-hero">
        {heroSlides.map((slide, index) => (
          <picture
            className="ab-hero__slide"
            data-active={index === activeHeroSlide}
            key={slide.image}
            style={{ opacity: index === activeHeroSlide ? 1 : 0 }}
          >
            <img
              alt={slide.alt}
              aria-hidden={index === activeHeroSlide ? undefined : true}
              fetchPriority={index === 0 ? 'high' : undefined}
              src={slide.image}
            />
          </picture>
        ))}
        <div className="ab-hero__shade" />
        <div className="ab-hero__content" data-reveal="hero">
          <div className="ab-hero__copy" key={activeHeroSlide}>
            <p className="ab-kicker">{heroContent.eyebrow}</p>
            <h1>{heroContent.title}<br /><em className="editorial">{heroContent.titleAccent}</em></h1>
            <p>{heroContent.description}</p>
            <div className="ab-actions">
              <Link className="button button--primary" to="/men">Mua đồ nam</Link>
              <Link className="button button--light" to="/women">Mua đồ nữ</Link>
            </div>
          </div>
        </div>
        <div className="ab-hero__dots" role="tablist" aria-label="Chọn ảnh giới thiệu">
          {heroSlides.map((slide, index) => (
            <button
              aria-label={`Xem ảnh giới thiệu ${index + 1}`}
              aria-selected={index === activeHeroSlide}
              className="ab-hero__dot"
              data-active={index === activeHeroSlide}
              key={slide.image}
              onClick={() => setActiveHeroSlide(index)}
              role="tab"
              type="button"
            />
          ))}
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
              <article className="ab-product-card" data-category={product.category} data-reveal key={product.id} style={revealDelay(index)}>
                <Link to={`/products/${product.id}`}>
                  <div className="ab-product-card__image">
                    <img alt={product.name} src={product.image} />
                    {index === 0 ? <span>Mới</span> : null}
                  </div>
                  <h3>{product.name}</h3><strong>{formatVnd(product.price)}</strong>
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
