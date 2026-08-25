import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import products from '../../data/catalogue.generated.json'
import { formatVnd } from '../../lib/format'

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => inputRef.current?.focus())
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')
    if (!normalized) return products.slice(0, 6)
    return products
      .filter((product) => `${product.name} ${product.category} ${product.audience}`.toLocaleLowerCase('vi').includes(normalized))
      .slice(0, 8)
  }, [query])

  if (!open) return null

  const submit = () => {
    const normalized = query.trim()
    if (!normalized) return
    onClose()
    void navigate(`/search?q=${encodeURIComponent(normalized)}`)
  }

  return (
    <div aria-label="Tìm kiếm sản phẩm" aria-modal="true" className="search-overlay" role="dialog">
      <button aria-label="Đóng tìm kiếm" className="search-overlay__backdrop" onClick={onClose} type="button" />
      <section className="search-overlay__panel">
        <header>
          <form onSubmit={(event) => { event.preventDefault(); submit() }}>
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="global-search">Tìm kiếm sản phẩm</label>
            <input
              id="global-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm giày, trang phục, phụ kiện…"
              ref={inputRef}
              type="search"
              value={query}
            />
          </form>
          <button aria-label="Đóng" className="icon-button" onClick={onClose} type="button"><X aria-hidden="true" /></button>
        </header>
        <div className="search-overlay__heading">
          <span>{query.trim() ? `${results.length} kết quả gợi ý` : 'Được tìm nhiều'}</span>
          {query.trim() ? <button onClick={submit} type="button">Xem tất cả <ArrowRight aria-hidden="true" /></button> : null}
        </div>
        <div className="search-suggestions">
          {results.map((product) => (
            <Link key={product.id} onClick={onClose} to={`/products/${product.id}`}>
              <img alt="" src={product.image} />
              <span><strong>{product.name}</strong><small>{product.category} · {formatVnd(product.price)}</small></span>
            </Link>
          ))}
          {results.length === 0 ? <p>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa ngắn hơn.</p> : null}
        </div>
      </section>
    </div>
  )
}
