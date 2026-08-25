import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthProvider'
import { AdminGuard } from './AdminGuard'

describe('AdminGuard', () => {
  it('redirects an unauthenticated visitor to the shared login page', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route element={<AdminGuard />}>
              <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>Shared login</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Shared login')).toBeInTheDocument()
    expect(screen.queryByText('Admin dashboard')).not.toBeInTheDocument()
  })
})
