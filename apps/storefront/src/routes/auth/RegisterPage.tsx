import { useState, type FormEvent } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthCard } from './AuthCard'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận chưa khớp.')
      return
    }

    if (!acceptedTerms) {
      setMessage('Bạn cần đồng ý điều khoản để đăng ký.')
      return
    }

    if (!supabase) {
      setMessage('Supabase chưa được cấu hình. Hãy sao chép .env.example thành .env.local.')
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    setSubmitting(false)

    if (error) {
      const normalizedMessage = error.message.toLowerCase()
      if (error.status === 429 || normalizedMessage.includes('rate limit')) {
        setMessage('Bạn đã thử quá nhiều lần. Vui lòng đợi một lúc rồi đăng ký lại.')
      } else if (normalizedMessage.includes('password')) {
        setMessage('Mật khẩu chưa đạt yêu cầu. Hãy dùng ít nhất 8 ký tự.')
      } else if (normalizedMessage.includes('email')) {
        setMessage('Địa chỉ email chưa hợp lệ hoặc chưa thể nhận thư xác minh.')
      } else {
        setMessage(`Chưa thể tạo tài khoản (${error.code ?? 'auth_error'}). Vui lòng thử lại.`)
      }
      return
    }

    if (!data.user) {
      setMessage('Supabase chưa trả về tài khoản mới. Vui lòng thử lại.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <main className="permission-page" id="main-content">
        <p className="eyebrow">Chỉ còn một bước</p>
        <h1>Kiểm tra email của bạn.</h1>
        <p>Chúng tôi đã gửi liên kết xác minh để hoàn tất tài khoản HORIZ.</p>
        <a className="button button--primary" href="/login">Đến trang đăng nhập</a>
      </main>
    )
  }

  return (
    <AuthCard
      description="Theo dõi đơn hàng, lưu địa chỉ và nhận trải nghiệm phù hợp hơn."
      eyebrow="Trở thành thành viên"
      footerLabel="Đăng nhập"
      footerLink="/login"
      footerText="Đã có tài khoản?"
      onSubmit={(event) => void handleSubmit(event)}
      title="Gia nhập HORIZ"
    >
      {!isSupabaseConfigured ? <div className="notice" role="status">Chế độ giao diện: Supabase chưa được kết nối.</div> : null}
      <label className="field">
        <span>Email</span>
        <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Mật khẩu</span>
          <input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </label>
        <label className="field">
          <span>Xác nhận</span>
          <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
        </label>
      </div>
      <label className="checkbox-field">
        <input checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} type="checkbox" />
        <span>Tôi đồng ý với Điều khoản và Chính sách quyền riêng tư.</span>
      </label>
      <button className="button button--primary button--wide" disabled={submitting} type="submit">
        {submitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
      </button>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
    </AuthCard>
  )
}
