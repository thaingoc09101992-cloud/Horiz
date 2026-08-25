import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('HORIZ UI error', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="permission-page" id="main-content">
          <p className="eyebrow">Đã có lỗi xảy ra</p>
          <h1>HORIZ chưa thể hiển thị trang này.</h1>
          <p>Hãy tải lại trang. Nếu lỗi vẫn còn, vui lòng thử lại sau.</p>
          <button className="button button--primary" onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
