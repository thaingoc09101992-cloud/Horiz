interface AuthProblem {
  code?: string
  message?: string
  status?: number
}

export interface LoginErrorFeedback {
  message: string
  requiresEmailConfirmation: boolean
}

export function getLoginErrorFeedback(error: AuthProblem): LoginErrorFeedback {
  const code = error.code?.toLowerCase() ?? ''
  const message = error.message?.toLowerCase() ?? ''

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return {
      message: 'Email chưa được xác minh. Hãy kiểm tra hộp thư hoặc gửi lại email xác minh.',
      requiresEmailConfirmation: true,
    }
  }

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return {
      message: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
      requiresEmailConfirmation: false,
    }
  }

  if (error.status === 429 || code.includes('rate_limit') || message.includes('rate limit')) {
    return {
      message: 'Bạn đã thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.',
      requiresEmailConfirmation: false,
    }
  }

  return {
    message: 'Không thể đăng nhập lúc này. Vui lòng kiểm tra kết nối và thử lại.',
    requiresEmailConfirmation: false,
  }
}
