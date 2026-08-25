import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ShapeTheme = 'rounded' | 'square'

export const SHAPE_THEME_STORAGE_KEY = 'horiz-shape-theme:v1'

type ThemeContextValue = {
  setTheme: (theme: ShapeTheme) => void
  theme: ShapeTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function normalizeTheme(value: string | null): ShapeTheme {
  return value === 'square' ? 'square' : 'rounded'
}

function readStoredTheme(): ShapeTheme {
  try {
    return normalizeTheme(window.localStorage.getItem(SHAPE_THEME_STORAGE_KEY))
  } catch {
    return 'rounded'
  }
}

function applyTheme(theme: ShapeTheme) {
  document.documentElement.dataset.shapeTheme = theme
}

function persistTheme(theme: ShapeTheme) {
  try {
    window.localStorage.setItem(SHAPE_THEME_STORAGE_KEY, theme)
  } catch {
    // The active theme still applies when storage is unavailable.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ShapeTheme>(readStoredTheme)

  const setTheme = useCallback((nextTheme: ShapeTheme) => {
    applyTheme(nextTheme)
    persistTheme(nextTheme)
    setThemeState(nextTheme)
  }, [])

  useEffect(() => {
    applyTheme(theme)
    persistTheme(theme)
  }, [theme])

  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== SHAPE_THEME_STORAGE_KEY) return
      const nextTheme = normalizeTheme(event.newValue)
      applyTheme(nextTheme)
      setThemeState(nextTheme)
    }
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  const value = useMemo(() => ({ setTheme, theme }), [setTheme, theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme phải được dùng bên trong ThemeProvider.')
  return context
}
