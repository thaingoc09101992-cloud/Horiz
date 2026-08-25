import { Link } from 'react-router'

export function NotFoundPage() {
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
