import { describe, expect, it } from 'vitest'
import { formatCompactNumber, formatVnd } from './format'

describe('format helpers', () => {
  it('formats VND without decimal digits', () => {
    expect(formatVnd(2_499_000)).toMatch(/2\.499\.000/)
  })

  it('formats compact counts in Vietnamese', () => {
    expect(formatCompactNumber(1_284)).toMatch(/1[,.]3/)
  })
})
