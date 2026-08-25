import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import type { AppRole, AuthState } from './auth-types'

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readRole(user: User | null): AppRole {
  const metadata: unknown = user?.app_metadata
  const role =
    typeof metadata === 'object' && metadata !== null && 'role' in metadata
      ? metadata.role
      : undefined
  return role === 'admin' || role === 'staff' ? role : 'customer'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AppRole>('customer')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user)
        setRole(readRole(data.user))
        setLoading(false)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setRole(readRole(session?.user ?? null))
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) return

    let active = true

    void supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .maybeSingle()
      .then((result) => {
        const data: unknown = result.data
        const databaseRole =
          typeof data === 'object' && data !== null && 'role' in data ? data.role : undefined
        if (active && (databaseRole === 'admin' || databaseRole === 'staff' || databaseRole === 'customer')) {
          setRole(databaseRole)
        }
      })

    return () => {
      active = false
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      configured: isSupabaseConfigured,
      signOut: async () => {
        if (supabase) await supabase.auth.signOut()
      },
    }),
    [loading, role, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được sử dụng bên trong AuthProvider.')
  return context
}
