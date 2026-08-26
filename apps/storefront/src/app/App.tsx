import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { ErrorBoundary } from '../components/feedback/ErrorBoundary'
import { PageLoader } from '../components/feedback/PageLoader'
import { StorefrontLayout } from '../components/layout/StorefrontLayout'
import { AdminGuard } from '../features/auth/AdminGuard'
import { AccountGuard } from '../features/auth/AccountGuard'
import { ForgotPasswordPage } from '../routes/auth/ForgotPasswordPage'
import { LoginPage } from '../routes/auth/LoginPage'
import { RegisterPage } from '../routes/auth/RegisterPage'
import { ResetPasswordPage } from '../routes/auth/ResetPasswordPage'
import { HomePage } from '../routes/HomePage'
import { NotFoundPage } from '../routes/NotFoundPage'
import { StaticContentPage } from '../routes/StaticContentPage'

const SearchPage = lazy(() => import('../routes/SearchPage').then((module) => ({ default: module.SearchPage })))
const AccountPage = lazy(() => import('../routes/account/AccountPage').then((module) => ({ default: module.AccountPage })))
const CataloguePage = lazy(() => import('../routes/CataloguePage').then((module) => ({ default: module.CataloguePage })))
const ProductDetailPage = lazy(() => import('../routes/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })))
const CartPage = lazy(() => import('../routes/CartPage').then((module) => ({ default: module.CartPage })))
const CheckoutPage = lazy(() => import('../routes/CheckoutPage').then((module) => ({ default: module.CheckoutPage })))

const AdminLayout = lazy(() =>
  import('../routes/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })),
)
const AdminDashboardPage = lazy(() =>
  import('../routes/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminPlaceholderPage = lazy(() =>
  import('../routes/admin/AdminPlaceholderPage').then((module) => ({
    default: module.AdminPlaceholderPage,
  })),
)

export function App() {
  return (
    <ErrorBoundary>
      <a className="skip-link" href="#main-content">
        Bỏ qua đến nội dung chính
      </a>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<StorefrontLayout />}>
            <Route index element={<HomePage />} />
            <Route path="women" element={<CataloguePage />} />
            <Route path="men" element={<CataloguePage />} />
            <Route path="unisex" element={<CataloguePage />} />
            <Route path="toddler" element={<CataloguePage />} />
            <Route path="collections/:collection" element={<CataloguePage />} />
            <Route path="products/:productId" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            {['about', 'materials', 'help', 'returns', 'privacy', 'terms'].map((path) => <Route element={<StaticContentPage />} key={path} path={path} />)}
            <Route element={<AccountGuard />}>
              <Route path="account" element={<AccountPage />} />
              <Route path="account/orders" element={<AccountPage />} />
              <Route path="account/addresses" element={<AccountPage />} />
              <Route path="account/wishlist" element={<AccountPage />} />
            </Route>
          </Route>

          <Route element={<AdminGuard />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path=":section" element={<AdminPlaceholderPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
