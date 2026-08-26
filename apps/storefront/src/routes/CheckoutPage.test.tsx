import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CheckoutConfirmation } from './CheckoutPage'

describe('CheckoutConfirmation', () => {
  it('shows the order number and generates a QR code from it', () => {
    const orderNumber = 'HZ-20260826-000007'

    render(
      <MemoryRouter>
        <CheckoutConfirmation result={{
          currency: 'VND',
          grand_total: 5840000,
          order_id: 'order-id',
          order_number: orderNumber,
          payment_method: 'cod',
        }} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: orderNumber })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: `QR mã đơn hàng ${orderNumber}` })).toBeInTheDocument()
  })
})
