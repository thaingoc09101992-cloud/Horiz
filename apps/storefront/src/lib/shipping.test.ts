import { describe, expect, it } from 'vitest'
import { calculateShipping } from './shipping'

describe('calculateShipping', () => {
  it('tính phí tiêu chuẩn dưới ngưỡng miễn phí', () => expect(calculateShipping(1_499_999)).toBe(30_000))
  it('miễn phí từ 1.500.000₫', () => expect(calculateShipping(1_500_000)).toBe(0))
})
