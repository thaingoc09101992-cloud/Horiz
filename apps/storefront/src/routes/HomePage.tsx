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

// Hero slideshow — slide 0 keeps the original (CMS-overridable) copy; slides 1–3
// carry their own copy for the women's, footwear and kids stories. Interval must
// stay well above the 3s image transition (see .ab-hero-slide-in) so each banner
// still gets a visible hold before the next one eases in.
const HERO_SLIDE_INTERVAL_MS = 5500
const heroSlides = [
  {
    image: '/prototype/hero-1.webp',
    alt: 'HORIZ — người mặc áo thun trắng và quần linen bên bờ biển lúc hoàng hôn',
    eyebrow: 'HORIZ / BỘ SƯU TẬP MỚI',
    title: 'Thiết kế vượt thời gian.',
    titleAccent: 'Nhịp sống hiện đại.',
    description: 'Những thiết kế được chăm chút cho một cuộc sống luôn chuyển động. Tinh tế một cách tự nhiên.',
  },
  {
    image: '/prototype/hero-2.webp',
    alt: 'HORIZ — người mặc sơ mi và quần linen trắng tựa vào vách đá trên đồi cát',
    eyebrow: 'HORIZ / BỘ SƯU TẬP NỮ',
    title: 'Thanh lịch không gắng sức.',
    titleAccent: 'Đẹp theo cách rất riêng.',
    description: 'Phom dáng buông nhẹ, sắc trung tính và chất vải tự nhiên — nữ tính bền vững qua từng mùa.',
  },
  {
    image: '/prototype/hero-3.webp',
    alt: 'HORIZ — cận cảnh hai đôi giày dệt đứng trên tảng đá nhìn ra biển',
    eyebrow: 'HORIZ / GIÀY THOẢI MÁI',
    title: 'Êm từ bước đầu tiên.',
    titleAccent: 'Đi cùng bạn cả ngày.',
    description: 'Thân giày dệt liền ôm chân, đế nhẹ đàn hồi — đôi giày khiến bạn quên mất mình đang mang.',
  },
  {
    image: '/prototype/hero-4.webp',
    alt: 'HORIZ — hai em nhỏ mặc trang phục tông kem đứng bên bức tường nắng',
    eyebrow: 'HORIZ / BỘ SƯU TẬP TRẺ EM',
    title: 'Thoải mái để con khám phá.',
    titleAccent: 'Bền bỉ qua mọi trò chơi.',
    description: 'Chất vải mềm, lành với làn da bé và đủ chắc cho những ngày chạy nhảy không ngừng.',
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
  // active = slide shown now, prev = slide held underneath while the incoming one
  // eases in (so there's no dark flash mid-transition).
  const [hero, setHero] = useState<{ active: number; prev: number | null }>({ active: 0, prev: null })

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

  const goToHeroSlide = (next: number) => {
    setHero((current) => (next === current.active ? current : { active: next, prev: current.active }))
  }

  // Auto-advance the hero slideshow. The 1s ease-in transition is reduced to an
  // instant swap for prefers-reduced-motion users by the global motion rule, so
  // the rotation itself can stay on for everyone. Re-armed on each change.
  useEffect(() => {
    const next = (hero.active + 1) % heroSlides.length
    const timeoutId = window.setTimeout(() => {
      setHero((current) => ({ active: next, prev: current.active }))
    }, HERO_SLIDE_INTERVAL_MS)
    return () => window.clearTimeout(timeoutId)
  }, [hero.active])

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

  const heroContent = hero.active === 0 ? heroCopy : heroSlides[hero.active] ?? heroCopy

  return (
    <main id="main-content" className="ab-home" ref={homeRef}>
      <section className="ab-hero">
        <div className="ab-hero__stage" aria-hidden="true">
          {heroSlides.map((slide, index) => {
            const state =
              index === hero.active ? 'active' : index === hero.prev ? 'leaving' : 'idle'
            return (
              <picture className="ab-hero__slide" data-state={state} key={slide.image}>
                <img
                  alt={slide.alt}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  src={slide.image}
                />
              </picture>
            )
          })}
        </div>
        <div className="ab-hero__content" data-reveal="hero">
          <div className="ab-hero__copy" key={hero.active}>
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
              aria-selected={index === hero.active}
              className="ab-hero__dot"
              data-active={index === hero.active}
              key={slide.image}
              onClick={() => goToHeroSlide(index)}
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
          <div>
            <p>Where light meets the <span className="ab-philosophy__mark">HORIZ</span>on,<br />every step finds its own rhythm.<br />Light as wind, lasting as earth.</p>
          </div>
          <div>
            <p>Nơi ánh sáng chạm đường chân trời,<br />mỗi bước chân cũng tìm được nhịp riêng.<br />Nhẹ như gió, bền như đất.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
