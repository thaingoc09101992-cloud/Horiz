import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import products from '../data/catalogue.generated.json'
import { formatVnd } from '../lib/format'

const pageContent: Record<string, { audience?: string; title: string; description: string }> = {
  women: { audience: 'Women', title: 'Nữ', description: 'Giày và trang phục nhẹ, linh hoạt cho từng chuyển động trong ngày.' },
  men: { audience: 'Men', title: 'Nam', description: 'Thiết kế thoải mái từ phố thị đến những hành trình cuối tuần.' },
  unisex: { audience: 'Unisex', title: 'Unisex', description: 'Form tối giản, màu sắc dễ phối, dành cho mọi phong cách.' },
  toddler: { audience: 'Toddler', title: 'Trẻ em', description: 'Những đôi giày nhẹ và linh hoạt cho bước chân nhỏ.' },
  new: { title: 'Bộ sưu tập', description: 'Danh mục sản phẩm được tuyển chọn từ manifest HORIZ.' },
  'best-sellers': { title: 'Best Sellers', description: 'Các thiết kế nổi bật trong catalogue HORIZ.' },
}

export function CataloguePage() {
  const { collection } = useParams()
  const { pathname } = useLocation()
  const pageKey = collection ?? pathname.split('/').filter(Boolean)[0] ?? 'new'
  const content = pageContent[pageKey] ?? { title: 'Bộ sưu tập', description: 'Danh mục sản phẩm được tuyển chọn từ manifest HORIZ.' }
  const [category, setCategory] = useState('Tất cả')
  const [sort, setSort] = useState('featured')

  const audienceProducts = useMemo(
    () => products.filter((product) => !content.audience || product.audience === content.audience),
    [content.audience],
  )
  const categories = useMemo(() => ['Tất cả', ...new Set(audienceProducts.map((product) => product.category))], [audienceProducts])
  const selectedCategory = categories.includes(category) ? category : 'Tất cả'
  const visibleProducts = useMemo(() => {
    const filtered = selectedCategory === 'Tất cả' ? audienceProducts : audienceProducts.filter((product) => product.category === selectedCategory)
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [audienceProducts, selectedCategory, sort])

  return (
    <main className="catalogue-page" id="main-content">
      <div className="catalogue-toolbar">
        <div className="catalogue-tabs" role="group" aria-label="Loại sản phẩm">
          {categories.map((item) => <button className={selectedCategory === item ? 'active' : ''} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}
        </div>
        <div className="catalogue-toolbar__actions"><label><span className="sr-only">Sắp xếp</span><select onChange={(event) => setSort(event.target.value)} value={sort}><option value="featured">Nổi bật</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select></label><Link className="button button--secondary" to={`/search?${content.audience ? `audience=${content.audience}` : ''}`}>Lọc theo size, màu</Link></div>
      </div>
      <p className="catalogue-count">{visibleProducts.length} sản phẩm</p>
      <section aria-label={content.title} className="catalogue-grid">
        {visibleProducts.map((product) => (
          <article className="ab-product-card" key={product.id}>
            <Link to={`/products/${product.id}`}>
              <div className="ab-product-card__image"><img alt={product.name} loading="lazy" src={product.image} /></div>
              <h3>{product.name}</h3><p>{product.category} · {product.imageCount} ảnh</p>
            </Link>
            <strong>{formatVnd(product.price)}</strong>
          </article>
        ))}
      </section>
    </main>
  )
}
