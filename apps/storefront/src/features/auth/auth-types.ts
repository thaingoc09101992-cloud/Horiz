import type { User } from '@supabase/supabase-js'

export type AppRole = 'customer' | 'staff' | 'admin'

export interface AuthState {
  user: User | null
  role: AppRole
  loading: boolean
  configured: boolean
}
