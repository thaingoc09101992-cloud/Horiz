import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>{theme}</button>
}

describe('ThemeProvider', () => {
  it('toggles theme and updates the document attribute', () => {
    localStorage.setItem('horiz-theme', 'light')
    render(<ThemeProvider><ThemeProbe /></ThemeProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'light' }))

    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
