import { describe, expect, it } from 'vitest'
import { getLoginErrorFeedback } from './authMessages'

describe('getLoginErrorFeedback', () => {
  it('hướng dẫn xác minh khi email chưa được xác nhận', () => {
    expect(getLoginErrorFeedback({ code: 'email_not_confirmed' })).toEqual({
      message: 'Email chưa được xác minh. Hãy kiểm tra hộp thư hoặc gửi lại email xác minh.',
      requiresEmailConfirmation: true,
    })
  })

  it('không tiết lộ tài khoản khi thông tin đăng nhập sai', () => {
    expect(getLoginErrorFeedback({ code: 'invalid_credentials' })).toEqual({
      message: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
      requiresEmailConfirmation: false,
    })
  })
})
