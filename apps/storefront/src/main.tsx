import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Primary UI face — Be Vietnam Pro, chosen for full Vietnamese diacritic
// coverage (Instrument Sans ships no Vietnamese glyphs on Google Fonts).
import '@fontsource/be-vietnam-pro/latin-400.css'
import '@fontsource/be-vietnam-pro/latin-500.css'
import '@fontsource/be-vietnam-pro/latin-600.css'
import '@fontsource/be-vietnam-pro/vietnamese-400.css'
import '@fontsource/be-vietnam-pro/vietnamese-500.css'
import '@fontsource/be-vietnam-pro/vietnamese-600.css'
// Editorial serif — the ~10% "brand statement" moments (hero, campaign titles).
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/cormorant-garamond/vietnamese-400.css'
import '@fontsource/cormorant-garamond/vietnamese-500.css'
import '@fontsource/cormorant-garamond/vietnamese-400-italic.css'
import { App } from './app/App'
import { AuthProvider } from './features/auth/AuthProvider'
import { CartProvider } from './features/cart/CartProvider'
import { ThemeProvider } from './features/theme/ThemeProvider'
import './styles/global.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Không tìm thấy phần tử #root để khởi tạo ứng dụng.')
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider><App /></CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
