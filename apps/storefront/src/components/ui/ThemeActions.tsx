import { Expand, Minimize, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../../features/theme/ThemeProvider'

export function ThemeActions() {
  const { theme, toggleTheme } = useTheme()
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement))

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  }

  return (
    <div className="utility-actions">
      <button
        aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
        className="icon-button"
        onClick={toggleTheme}
        type="button"
      >
        {theme === 'light' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
      </button>
      <button
        aria-label={fullscreen ? 'Thoát chế độ toàn màn hình' : 'Xem toàn màn hình'}
        className="icon-button"
        onClick={() => void toggleFullscreen()}
        type="button"
      >
        {fullscreen ? <Minimize aria-hidden="true" /> : <Expand aria-hidden="true" />}
      </button>
    </div>
  )
}
