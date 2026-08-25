import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthCard } from './AuthCard'

function safeReturnTo(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setMessage('Supabase chưa được cấu hình. Hãy sao chép .env.example thành .env.local.')
      return
    }

    setSubmitting(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)

    if (error) {
      setMessage('Không thể đăng nhập. Hãy kiểm tra thông tin và thử lại.')
      return
    }

    void navigate(safeReturnTo(searchParams.get('returnTo')), { replace: true })
  }

  return (
    <AuthCard
      description="Truy cập đơn hàng, địa chỉ và những lựa chọn đã lưu của bạn."
      eyebrow="Chào mừng trở lại"
      footerLabel="Tạo tài khoản"
      footerLink="/register"
      footerText="Chưa là thành viên?"
      onSubmit={(event) => void handleSubmit(event)}
      title="Đăng nhập HORIZ"
    >
      {!isSupabaseConfigured ? (
        <div className="notice" role="status">
          Chế độ giao diện: kết nối Supabase sau khi cấu hình môi trường.
        </div>
      ) : null}
      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="field">
        <span>Mật khẩu</span>
        <input
          autoComplete="current-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <button className="button button--primary button--wide" disabled={submitting} type="submit">
        {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <a className="auth-card__minor-link" href="/forgot-password">
        Quên mật khẩu?
      </a>
    </AuthCard>
  )
}
