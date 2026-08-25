import { Link } from 'react-router'

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="HORIZ — Trang chủ" className={compact ? 'wordmark wordmark--compact' : 'wordmark'} to="/">
      <img alt="" aria-hidden="true" src="/horiz-wordmark.png" />
    </Link>
  )
}
