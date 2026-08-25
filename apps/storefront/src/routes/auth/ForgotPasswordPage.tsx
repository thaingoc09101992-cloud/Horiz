import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { AuthCard } from './AuthCard'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return setMessage('Chưa thể kết nối dịch vụ tài khoản.')
    setSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/reset-password` })
    setSubmitting(false)
    setMessage(error ? 'Chưa thể gửi email. Vui lòng thử lại sau.' : 'Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu.')
  }

  return <AuthCard description="Nhập email tài khoản để nhận liên kết đặt lại mật khẩu." eyebrow="Khôi phục tài khoản" footerLabel="Đăng nhập" footerLink="/login" footerText="Đã nhớ mật khẩu?" onSubmit={(event) => void submit(event)} title="Quên mật khẩu"><label className="field"><span>Email</span><input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label><button className="button button--primary button--wide" disabled={submitting} type="submit">{submitting ? 'Đang gửi…' : 'Gửi liên kết khôi phục'}</button>{message ? <p className="form-message form-message--neutral" role="status">{message}</p> : null}</AuthCard>
}
