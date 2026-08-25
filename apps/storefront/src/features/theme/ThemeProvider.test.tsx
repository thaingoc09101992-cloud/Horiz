import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SHAPE_THEME_STORAGE_KEY, ThemeProvider, useTheme } from './ThemeProvider'

function ThemeHarness() {
  const { setTheme, theme } = useTheme()
  return <><span>Theme: {theme}</span><button onClick={() => setTheme('square')} type="button">Vuông góc</button></>
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.shapeTheme
  })

  it('dùng Bo tròn làm theme mặc định', () => {
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>)
    expect(screen.getByText('Theme: rounded')).toBeInTheDocument()
    expect(document.documentElement.dataset.shapeTheme).toBe('rounded')
    expect(localStorage.getItem(SHAPE_THEME_STORAGE_KEY)).toBe('rounded')
  })

  it('lưu và áp dụng theme Vuông góc', () => {
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Vuông góc' }))
    expect(screen.getByText('Theme: square')).toBeInTheDocument()
    expect(document.documentElement.dataset.shapeTheme).toBe('square')
    expect(localStorage.getItem(SHAPE_THEME_STORAGE_KEY)).toBe('square')
  })
})
