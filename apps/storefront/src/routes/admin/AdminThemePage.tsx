import { Check, Circle, Square } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTheme, type ShapeTheme } from '../../features/theme/ThemeProvider'

const themeOptions: Array<{
  description: string
  icon: typeof Circle
  id: ShapeTheme
  label: string
}> = [
  { id: 'rounded', label: 'Bo tròn', description: 'Theme hiện tại với card, nút và shape có góc bo mềm.', icon: Circle },
  { id: 'square', label: 'Vuông góc', description: 'Loại bỏ toàn bộ bán kính bo trên giao diện cửa hàng và admin.', icon: Square },
]

export function AdminThemePage() {
  const { setTheme, theme } = useTheme()
  const [draftTheme, setDraftTheme] = useState<ShapeTheme>(theme)
  const [message, setMessage] = useState('')

  const saveTheme = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTheme(draftTheme)
    setMessage(`Đã lưu theme “${themeOptions.find((option) => option.id === draftTheme)?.label}”.`)
  }

  return (
    <main className="admin-main admin-theme-page" id="main-content">
      <div className="admin-page-heading">
        <div><p className="eyebrow">HORIZ Administrator</p><h1>Giao diện</h1><p>Chọn ngôn ngữ hình khối dùng chung cho cửa hàng và trang quản trị.</p></div>
        <span className="status-badge">Đang dùng: {theme === 'rounded' ? 'Bo tròn' : 'Vuông góc'}</span>
      </div>

      <form onSubmit={saveTheme}>
        <fieldset className="theme-choices">
          <legend className="sr-only">Chọn theme giao diện</legend>
          {themeOptions.map(({ description, icon: Icon, id, label }) => (
            <label className="theme-choice" key={id}>
              <input checked={draftTheme === id} name="shape-theme" onChange={() => { setDraftTheme(id); setMessage('') }} type="radio" value={id} />
              <span className={`theme-preview theme-preview--${id}`} aria-hidden="true">
                <span className="theme-preview__top"><i /><i /></span>
                <span className="theme-preview__cards"><i /><i /><i /></span>
                <span className="theme-preview__button">Nút mẫu</span>
              </span>
              <span className="theme-choice__copy">
                <span className="theme-choice__title"><Icon aria-hidden="true" /><strong>{label}</strong>{theme === id ? <small><Check aria-hidden="true" /> Đang áp dụng</small> : null}</span>
                <span>{description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="theme-save-bar">
          <div><strong>Theme được áp dụng cho toàn bộ hệ thống</strong><span>Lựa chọn được lưu trên trình duyệt này và giữ nguyên sau khi tải lại.</span></div>
          <button className="button button--primary" disabled={draftTheme === theme} type="submit">Lưu theme</button>
        </div>
        {message ? <p className="form-message form-message--neutral" role="status">{message}</p> : null}
      </form>
    </main>
  )
}
