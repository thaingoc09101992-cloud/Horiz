import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthCard } from './AuthCard'
import { getLoginErrorFeedback } from './authMessages'

interface FormMessage {
  text: string
  tone: 'error' | 'neutral'
}

function explicitReturnTo(value: string | null): string | null {
  return value?.startsWith('/') && !value.startsWith('//') ? value : null
}

async function resolvePostLoginPath(userId: string): Promise<string> {
  if (!supabase) return '/'
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .maybeSingle()
  const role = typeof data === 'object' && data !== null && 'role' in data ? data.role : undefined
  return role === 'admin' ? '/admin' : '/'
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<FormMessage | null>(null)
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setMessage({ text: 'Supabase chưa được cấu hình. Hãy sao chép .env.example thành .env.local.', tone: 'error' })
      return
    }

    setSubmitting(true)
    setMessage(null)
    setRequiresEmailConfirmation(false)
    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })

    if (error) {
      setSubmitting(false)
      const feedback = getLoginErrorFeedback(error)
      setMessage({ text: feedback.message, tone: 'error' })
      setRequiresEmailConfirmation(feedback.requiresEmailConfirmation)
      return
    }

    const requestedPath = explicitReturnTo(searchParams.get('returnTo'))
    const destination = requestedPath ?? (data.user ? await resolvePostLoginPath(data.user.id) : '/')
    setSubmitting(false)

    void navigate(destination, { replace: true })
  }

  const handleResendConfirmation = async () => {
    if (!supabase || !email.trim()) return

    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    setResending(false)

    if (error) {
      const rateLimited = error.status === 429 || error.code?.includes('rate_limit') || error.message.toLowerCase().includes('rate limit')
      setMessage({
        text: rateLimited
          ? 'Email vừa được gửi gần đây. Vui lòng đợi một lúc rồi thử lại.'
          : 'Chưa thể gửi lại email xác minh. Vui lòng thử lại sau.',
        tone: 'error',
      })
      return
    }

    setMessage({ text: 'Đã gửi lại email xác minh. Hãy kiểm tra cả hộp thư Spam.', tone: 'neutral' })
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
      belowCard={
        <aside className="auth-exam-note">
          <p className="auth-exam-note__title">Tài khoản chấm bài (dành cho giáo viên)</p>
          <dl>
            <div>
              <dt>Admin</dt>
              <dd>admin@horiz.vn / Horiz@Admin2026</dd>
            </div>
            <div>
              <dt>Khách</dt>
              <dd>khach@horiz.vn / Horiz@Khach2026</dd>
            </div>
          </dl>
        </aside>
      }
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
      {message ? (
        <p className={`form-message${message.tone === 'neutral' ? ' form-message--neutral' : ''}`} role={message.tone === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      ) : null}
      {requiresEmailConfirmation ? (
        <button className="button button--secondary button--wide" disabled={resending} onClick={() => void handleResendConfirmation()} type="button">
          {resending ? 'Đang gửi lại…' : 'Gửi lại email xác minh'}
        </button>
      ) : null}
      <a className="auth-card__minor-link" href="/forgot-password">
        Quên mật khẩu?
      </a>
    </AuthCard>
  )
}
