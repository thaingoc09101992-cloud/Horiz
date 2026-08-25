import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/vietnamese-400.css'
import '@fontsource/manrope/vietnamese-500.css'
import '@fontsource/manrope/vietnamese-600.css'
import '@fontsource/manrope/vietnamese-700.css'
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
