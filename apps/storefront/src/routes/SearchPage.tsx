import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import products from '../data/catalogue.generated.json'
import { formatVnd } from '../lib/format'
import { getProductSizes } from '../lib/productOptions'

const colorKeywords = ['black', 'white', 'grey', 'gray', 'navy', 'blue', 'green', 'beige', 'brown', 'pink', 'red', 'yellow', 'orange', 'purple']

function inferredColor(name: string) {
  const normalized = name.toLowerCase()
  return colorKeywords.find((color) => normalized.includes(color)) ?? 'other'
}

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(params.get('q') ?? '')
  const [limit, setLimit] = useState(24)
  const query = params.get('q') ?? ''
  const audience = params.get('audience') ?? 'all'
  const category = params.get('category') ?? 'all'
  const size = params.get('size') ?? 'all'
  const color = params.get('color') ?? 'all'
  const sort = params.get('sort') ?? 'featured'

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setLimit(24)
    setParams(next)
  }

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')
    const filtered = products.filter((product) => {
      const matchesQuery = !normalized || `${product.name} ${product.category} ${product.audience}`.toLocaleLowerCase('vi').includes(normalized)
      const matchesAudience = audience === 'all' || product.audience === audience
      const matchesCategory = category === 'all' || product.category === category
      const matchesSize = size === 'all' || getProductSizes(product.category, product.audience).includes(size)
      const matchesColor = color === 'all' || inferredColor(product.name) === color
      return matchesQuery && matchesAudience && matchesCategory && matchesSize && matchesColor
    })
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
    if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    return filtered
  }, [audience, category, color, query, size, sort])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateParam('q', draft.trim())
  }

  const activeFilterCount = [audience, category, size, color].filter((value) => value !== 'all').length

  return (
    <main className="search-page" id="main-content">
      <header className="search-page__hero">
        <p className="ab-kicker">Khám phá catalogue</p><h1>{query ? `Kết quả cho “${query}”` : 'Tìm sản phẩm phù hợp'}</h1>
        <form onSubmit={submit}><Search aria-hidden="true" /><label className="sr-only" htmlFor="search-page-input">Từ khóa</label><input id="search-page-input" onChange={(event) => setDraft(event.target.value)} placeholder="Tên sản phẩm, danh mục…" type="search" value={draft} /><button type="submit">Tìm kiếm</button></form>
      </header>
      <div className="search-layout">
        <aside className="filter-panel">
          <div className="filter-panel__heading"><strong><SlidersHorizontal aria-hidden="true" /> Bộ lọc {activeFilterCount ? `(${activeFilterCount})` : ''}</strong>{activeFilterCount ? <button onClick={() => setParams(query ? { q: query } : {})} type="button"><X aria-hidden="true" /> Xóa</button> : null}</div>
          <label>Đối tượng<select onChange={(event) => updateParam('audience', event.target.value)} value={audience}><option value="all">Tất cả</option><option value="Women">Nữ</option><option value="Men">Nam</option><option value="Unisex">Unisex</option><option value="Toddler">Trẻ em</option></select></label>
          <label>Danh mục<select onChange={(event) => updateParam('category', event.target.value)} value={category}><option value="all">Tất cả</option><option value="Shoes">Giày</option><option value="Apparel">Trang phục</option><option value="Socks">Tất</option><option value="Underwear">Đồ mặc trong</option></select></label>
          <label>Kích thước<select onChange={(event) => updateParam('size', event.target.value)} value={size}><option value="all">Tất cả</option>{['XS', 'S', 'M', 'L', 'XL', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Màu sắc<select onChange={(event) => updateParam('color', event.target.value)} value={color}><option value="all">Tất cả</option><option value="black">Đen</option><option value="white">Trắng</option><option value="grey">Xám</option><option value="navy">Navy</option><option value="blue">Xanh dương</option><option value="green">Xanh lá</option><option value="beige">Be</option><option value="brown">Nâu</option><option value="other">Khác</option></select></label>
        </aside>
        <section className="search-results" aria-live="polite">
          <div className="search-results__toolbar"><span>{results.length} sản phẩm</span><label>Sắp xếp<select onChange={(event) => updateParam('sort', event.target.value)} value={sort}><option value="featured">Nổi bật</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option><option value="name">Tên A–Z</option></select></label></div>
          {results.length ? <div className="search-product-grid">{results.slice(0, limit).map((product) => <article className="ab-product-card" data-category={product.category} key={product.id}><Link to={`/products/${product.id}`}><div className="ab-product-card__image"><img alt={product.name} loading="lazy" src={product.image} /></div><h2>{product.name}</h2><strong>{formatVnd(product.price)}</strong></Link></article>)}</div> : <div className="empty-state"><Search aria-hidden="true" /><h2>Chưa tìm thấy sản phẩm</h2><p>Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác.</p></div>}
          {limit < results.length ? <button className="button button--secondary load-more" onClick={() => setLimit((value) => value + 24)} type="button">Xem thêm {Math.min(24, results.length - limit)} sản phẩm</button> : null}
        </section>
      </div>
    </main>
  )
}
