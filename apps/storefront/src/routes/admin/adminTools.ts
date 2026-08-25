import { supabase } from '../../lib/supabase'

type FunctionError = {
  context?: unknown
  message: string
}

export async function invokeAdminTools(body: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.')
  const invocation = await supabase.functions.invoke('admin-tools', { body }) as {
    data: unknown
    error: FunctionError | null
  }
  if (!invocation.error) return invocation.data

  if (invocation.error.context instanceof Response) {
    const payload = await invocation.error.context.clone().json().catch(() => null) as { error?: string } | null
    if (payload?.error) throw new Error(payload.error)
  }
  throw new Error(invocation.error.message)
}
