import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

const allowedRoles = new Set(['customer', 'staff', 'admin'])
const allowedMemberStates = new Set(['active', 'blocked'])
const allowedProductStates = new Set(['draft', 'published', 'archived'])

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { headers: corsHeaders, status })
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function integer(value: unknown, field: string, minimum = 0) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < minimum) throw new Error(field + ' phải là số nguyên từ ' + String(minimum) + ' trở lên.')
  return parsed
}

function boolean(value: unknown) {
  if (typeof value === 'boolean') return value
  return ['1', 'true', 'yes', 'có', 'x'].includes(text(value).toLocaleLowerCase('vi'))
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response({ error: 'Phương thức không được hỗ trợ.' }, 405)

  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) return response({ error: 'Bạn chưa đăng nhập.' }, 401)

    const url = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
    const service = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const token = authorization.replace('Bearer ', '')
    const { data: userData, error: userError } = await caller.auth.getUser(token)
    const callerId = userData.user?.id
    if (userError || !callerId) return response({ error: 'Phiên đăng nhập không hợp lệ.' }, 401)

    const [{ data: adminRole }, { data: memberState }] = await Promise.all([
      service.from('user_roles').select('id').eq('user_id', callerId).eq('role', 'admin').is('revoked_at', null).maybeSingle(),
      service.from('member_status').select('status').eq('user_id', callerId).maybeSingle(),
    ])
    if (!adminRole || memberState?.status !== 'active') return response({ error: 'Bạn không có quyền quản trị.' }, 403)

    const body = await request.json() as Record<string, unknown>
    const action = text(body.action)

    if (action === 'create_member') {
      const email = text(body.email).toLocaleLowerCase('en-US')
      const password = text(body.password)
      const fullName = text(body.full_name)
      const role = text(body.role) || 'customer'
      if (!email.includes('@')) throw new Error('Email không hợp lệ.')
      if (password.length < 8) throw new Error('Mật khẩu phải có ít nhất 8 ký tự.')
      if (!allowedRoles.has(role)) throw new Error('Vai trò không hợp lệ.')

      const { data, error } = await service.auth.admin.createUser({
        app_metadata: { role },
        email,
        email_confirm: true,
        password,
        user_metadata: { full_name: fullName },
      })
      if (error || !data.user) throw error ?? new Error('Không thể tạo thành viên.')

      const userId = data.user.id
      const { error: profileError } = await service.from('profiles').update({ email, full_name: fullName || null }).eq('id', userId)
      const { error: revokeError } = await service.from('user_roles').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null)
      const { error: roleError } = await service.from('user_roles').insert({ granted_by: callerId, role, user_id: userId })
      if (profileError || revokeError || roleError) {
        await service.auth.admin.deleteUser(userId)
        throw profileError ?? revokeError ?? roleError
      }
      return response({ id: userId })
    }

    if (action === 'update_member') {
      const userId = text(body.user_id)
      const role = text(body.role)
      const status = text(body.status)
      if (!userId) throw new Error('Thiếu thành viên cần cập nhật.')
      if (!allowedRoles.has(role) || !allowedMemberStates.has(status)) throw new Error('Quyền hoặc trạng thái không hợp lệ.')
      if (userId === callerId && (role !== 'admin' || status !== 'active')) {
        throw new Error('Bạn không thể tự hạ quyền hoặc khóa tài khoản Admin đang đăng nhập.')
      }

      const { data: currentAdmin } = await service.from('user_roles').select('id').eq('user_id', userId).eq('role', 'admin').is('revoked_at', null).maybeSingle()
      if (currentAdmin && (role !== 'admin' || status !== 'active')) {
        const { count } = await service.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin').is('revoked_at', null)
        if ((count ?? 0) <= 1) throw new Error('Hệ thống phải còn ít nhất một Admin hoạt động.')
      }

      const { data: activeRole } = await service.from('user_roles').select('id').eq('user_id', userId).eq('role', role).is('revoked_at', null).maybeSingle()
      if (!activeRole) {
        const { error } = await service.from('user_roles').insert({ granted_by: callerId, role, user_id: userId })
        if (error) throw error
      }
      const { error: revokeError } = await service.from('user_roles').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null).neq('role', role)
      const { error: stateError } = await service.from('member_status').update({ status, updated_at: new Date().toISOString(), updated_by: callerId }).eq('user_id', userId)
      const { error: authError } = await service.auth.admin.updateUserById(userId, { app_metadata: { role } })
      if (revokeError || stateError || authError) throw revokeError ?? stateError ?? authError
      return response({ id: userId })
    }

    const rows = Array.isArray(body.rows) ? body.rows as Record<string, unknown>[] : []
    if (!rows.length) throw new Error('File không có dữ liệu.')
    if (rows.length > 500) throw new Error('Mỗi lần chỉ import tối đa 500 dòng.')

    if (action === 'import_products') {
      const payload = rows.map((row) => {
        const slug = text(row.slug).toLocaleLowerCase('en-US')
        const name = text(row.name)
        const status = text(row.status) || 'draft'
        if (!slug || !name) throw new Error('Mỗi sản phẩm phải có slug và name.')
        if (!allowedProductStates.has(status)) throw new Error('Trạng thái sản phẩm không hợp lệ: ' + status)
        return {
          description: text(row.description) || null,
          featured: boolean(row.featured),
          name,
          slug,
          status,
          subtitle: text(row.subtitle) || null,
        }
      })
      const { error } = await service.from('products').upsert(payload, { onConflict: 'slug' })
      if (error) throw error
      return response({ updated: payload.length })
    }

    if (action === 'import_inventory' || action === 'import_pricing') {
      const skus = [...new Set(rows.map((row) => text(row.sku)).filter(Boolean))]
      const { data: variants, error: variantError } = await service.from('product_variants').select('id,sku').in('sku', skus)
      if (variantError) throw variantError
      const variantBySku = new Map((variants ?? []).map((variant) => [variant.sku, variant.id]))
      const missing = skus.filter((sku) => !variantBySku.has(sku))
      const matchedRows = rows.filter((row) => variantBySku.has(text(row.sku)))

      const results = action === 'import_inventory'
        ? await Promise.all(matchedRows.map((row) => service.from('inventory_items').update({
            on_hand: integer(row.on_hand, 'on_hand'),
            reorder_level: integer(row.reorder_level, 'reorder_level'),
            updated_at: new Date().toISOString(),
          }).eq('variant_id', variantBySku.get(text(row.sku))!)))
        : await Promise.all(matchedRows.map((row) => {
            const price = integer(row.price_amount, 'price_amount', 1)
            const compareText = text(row.compare_at_amount)
            const compareAt = compareText ? integer(row.compare_at_amount, 'compare_at_amount', price) : null
            return service.from('product_variants').update({
              compare_at_amount: compareAt,
              price_amount: price,
              updated_at: new Date().toISOString(),
            }).eq('id', variantBySku.get(text(row.sku))!)
          }))

      const failed = results.find((result) => result.error)
      if (failed?.error) throw failed.error
      return response({ missing, updated: matchedRows.length })
    }

    return response({ error: 'Thao tác không được hỗ trợ.' }, 400)
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : 'Không thể xử lý yêu cầu.' }, 400)
  }
})
