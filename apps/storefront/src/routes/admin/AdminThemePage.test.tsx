import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SHAPE_THEME_STORAGE_KEY, ThemeProvider } from '../../features/theme/ThemeProvider'
import { AdminThemePage } from './AdminThemePage'

describe('AdminThemePage', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.shapeTheme
  })

  it('lưu theme Vuông góc từ theme Bo tròn mặc định', () => {
    render(<ThemeProvider><AdminThemePage /></ThemeProvider>)
    expect(screen.getByText('Đang dùng: Bo tròn')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /Vuông góc/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu theme' }))

    expect(screen.getByText('Đang dùng: Vuông góc')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu theme “Vuông góc”.')
    expect(localStorage.getItem(SHAPE_THEME_STORAGE_KEY)).toBe('square')
  })
})
