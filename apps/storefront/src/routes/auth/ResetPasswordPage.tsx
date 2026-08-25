import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { AuthCard } from './AuthCard'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirm) return setMessage('Mật khẩu xác nhận chưa khớp.')
    if (!supabase) return setMessage('Chưa thể kết nối dịch vụ tài khoản.')
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (error) return setMessage('Liên kết đã hết hạn hoặc mật khẩu chưa đạt yêu cầu.')
    void navigate('/account', { replace: true })
  }
  return <AuthCard description="Dùng ít nhất 8 ký tự và không tái sử dụng mật khẩu cũ." eyebrow="Bảo mật tài khoản" footerLabel="Yêu cầu liên kết mới" footerLink="/forgot-password" footerText="Liên kết hết hạn?" onSubmit={(event) => void submit(event)} title="Đặt mật khẩu mới"><label className="field"><span>Mật khẩu mới</span><input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label><label className="field"><span>Xác nhận mật khẩu</span><input autoComplete="new-password" minLength={8} onChange={(event) => setConfirm(event.target.value)} required type="password" value={confirm} /></label><button className="button button--primary button--wide" disabled={submitting} type="submit">{submitting ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</button>{message ? <p className="form-message" role="alert">{message}</p> : null}</AuthCard>
}
