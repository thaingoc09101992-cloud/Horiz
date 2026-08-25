import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrderStatusDonut } from './AdminDashboardPage'

describe('OrderStatusDonut', () => {
  it('renders the order total and a segment for every status', () => {
    const { container } = render(<OrderStatusDonut entries={[['pending_payment', 5], ['delivered', 3]]} total={8} />)

    expect(screen.getByRole('img', { name: 'Biểu đồ trạng thái của 8 đơn hàng' })).toBeInTheDocument()
    expect(screen.getByText('Chờ thanh toán')).toBeInTheDocument()
    expect(screen.getByText('Đã giao hàng')).toBeInTheDocument()
    expect(container.querySelectorAll('.donut-chart__segment')).toHaveLength(2)
  })

  it('renders an empty state when there are no orders', () => {
    render(<OrderStatusDonut entries={[]} total={0} />)

    expect(screen.getByText('Chưa có đơn')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(2)
  })
})
