import { Link } from 'react-router'
import { useSeoMeta } from '../lib/seo'

export function NotFoundPage() {
  // The Cloudflare Workers static-asset fallback (see wrangler.jsonc) serves
  // this component for any unmatched path with an HTTP 200, so this noindex
  // tag is the only signal search engines get that the URL isn't real content.
  useSeoMeta({ title: 'Không tìm thấy trang | HORIZ', description: 'Trang bạn tìm không tồn tại trên HORIZ.', path: '/404', noindex: true })

  return (
    <main className="permission-page" id="main-content">
      <p className="eyebrow">404 · Không tìm thấy</p>
      <h1>Con đường này chưa có trong HORIZ.</h1>
      <p>Trang bạn đang tìm có thể đã được di chuyển hoặc chưa được xây dựng.</p>
      <Link className="button button--primary" to="/">
        Trở về trang chủ
      </Link>
    </main>
  )
}
