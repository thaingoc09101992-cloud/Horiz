import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider, useCart } from './CartProvider'

function CartHarness() {
  const { addItem, itemCount, subtotal, updateQuantity } = useCart()
  return <><span>Số lượng: {itemCount}</span><span>Tạm tính: {subtotal}</span><button onClick={() => addItem({ productId: 'shoe-1', name: 'HORIZ Test', image: '/test.jpg', price: 1000000, size: '40' })}>Thêm</button><button onClick={() => addItem({ productId: 'shoe-2', name: 'HORIZ Multi', image: '/test-2.jpg', price: 500000, size: '39' }, 2)}>Thêm 2</button><button onClick={() => updateQuantity('shoe-1', '40', 3)}>Tăng</button></>
}

describe('CartProvider', () => {
  beforeEach(() => localStorage.clear())

  it('thêm sản phẩm và tính lại tổng tiền', () => {
    render(<CartProvider><CartHarness /></CartProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }))
    expect(screen.getByText('Số lượng: 1')).toBeInTheDocument()
    expect(screen.getByText('Tạm tính: 1000000')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tăng' }))
    expect(screen.getByText('Số lượng: 3')).toBeInTheDocument()
    expect(screen.getByText('Tạm tính: 3000000')).toBeInTheDocument()
  })

  it('thêm đúng số lượng đã chọn', () => {
    render(<CartProvider><CartHarness /></CartProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm 2' }))
    expect(screen.getByText('Số lượng: 2')).toBeInTheDocument()
    expect(screen.getByText('Tạm tính: 1000000')).toBeInTheDocument()
  })
})
