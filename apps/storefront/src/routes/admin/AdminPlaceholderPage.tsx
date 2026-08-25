import { ArrowRight, Edit3, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { formatVnd } from '../../lib/format'
import { supabase } from '../../lib/supabase'

type AdminRow = {
  id: string
  primary: string
  secondary: string
  status: string
  value: string
  rawValue?: number
}

const sectionLabels: Record<string, string> = {
  products: 'Sản phẩm', inventory: 'Tồn kho', pricing: 'Giá bán', discounts: 'Chiết khấu',
  orders: 'Đơn hàng', members: 'Thành viên', content: 'Nội dung', 'audit-logs': 'Nhật ký hoạt động',
}

function nestedRecord(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return nestedRecord(value[0])
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function readText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function formText(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export function AdminPlaceholderPage() {
  const { section = 'products' } = useParams()
  const label = sectionLabels[section] ?? 'Quản trị'
  const [rows, setRows] = useState<AdminRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editor, setEditor] = useState<AdminRow | 'create' | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setMessage('')
    try {
      let next: AdminRow[] = []
      if (section === 'products') {
        const { data, error } = await supabase.from('products').select('id,name,slug,status,featured,updated_at').order('updated_at', { ascending: false }).limit(200)
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: item.id, primary: item.name, secondary: item.slug, status: item.status, value: item.featured ? 'Nổi bật' : 'Tiêu chuẩn' }))
      } else if (section === 'inventory') {
        const { data, error } = await supabase.from('inventory_items').select('variant_id,on_hand,reserved,reorder_level,product_variants(sku,title,products(name))').order('updated_at', { ascending: false }).limit(250)
        if (error) throw error
        next = (data ?? []).map((item) => { const variant = nestedRecord(item.product_variants); const product = nestedRecord(variant.products); const available = item.on_hand - item.reserved; return { id: item.variant_id, primary: readText(product.name, readText(variant.sku, 'SKU')), secondary: readText(variant.sku) + ' · ' + readText(variant.title), status: available <= 0 ? 'Hết hàng' : available <= item.reorder_level ? 'Sắp hết' : 'Ổn định', value: String(available) + ' khả dụng', rawValue: item.on_hand } })
      } else if (section === 'pricing') {
        const { data, error } = await supabase.from('product_variants').select('id,sku,title,price_amount,compare_at_amount,products(name)').order('updated_at', { ascending: false }).limit(250)
        if (error) throw error
        next = (data ?? []).map((item) => { const product = nestedRecord(item.products); return { id: item.id, primary: readText(product.name, item.sku), secondary: item.sku + ' · ' + item.title, status: item.compare_at_amount ? 'Đang giảm' : 'Giá thường', value: formatVnd(item.price_amount), rawValue: item.price_amount } })
      } else if (section === 'discounts') {
        const { data, error } = await supabase.from('promotions').select('id,name,status,discount_type,discount_value,starts_at,ends_at').order('created_at', { ascending: false })
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: item.id, primary: item.name, secondary: item.discount_type === 'percentage' ? String(item.discount_value / 100) + '%' : formatVnd(item.discount_value), status: item.status, value: item.starts_at ? new Intl.DateTimeFormat('vi-VN').format(new Date(item.starts_at)) : 'Chưa lên lịch' }))
      } else if (section === 'orders') {
        const { data, error } = await supabase.from('orders').select('id,order_number,email,status,grand_total,created_at').order('created_at', { ascending: false }).limit(200)
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: item.id, primary: item.order_number, secondary: item.email, status: item.status, value: formatVnd(item.grand_total), rawValue: item.grand_total }))
      } else if (section === 'members') {
        const [{ data: profiles, error }, { data: statuses }, { data: roles }] = await Promise.all([supabase.from('profiles').select('id,full_name,phone,created_at').order('created_at', { ascending: false }).limit(200), supabase.from('member_status').select('user_id,status'), supabase.from('user_roles').select('user_id,role,revoked_at').is('revoked_at', null)])
        if (error) throw error
        next = (profiles ?? []).map((item) => ({ id: item.id, primary: item.full_name || 'Thành viên HORIZ', secondary: item.phone || item.id.slice(0, 8), status: statuses?.find((status) => status.user_id === item.id)?.status ?? 'active', value: roles?.find((role) => role.user_id === item.id)?.role ?? 'customer' }))
      } else if (section === 'content') {
        const { data, error } = await supabase.from('content_sections').select('id,page_key,type,active,position,updated_at').order('page_key').order('position')
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: item.id, primary: item.page_key, secondary: item.type + ' · vị trí ' + String(item.position), status: item.active ? 'Đang hiển thị' : 'Đã ẩn', value: new Intl.DateTimeFormat('vi-VN').format(new Date(item.updated_at)) }))
      } else {
        const { data, error } = await supabase.from('audit_logs').select('id,action,entity_type,actor_id,created_at').order('created_at', { ascending: false }).limit(250)
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: String(item.id), primary: item.action.toUpperCase() + ' · ' + item.entity_type, secondary: item.actor_id ?? 'Hệ thống', status: 'Đã ghi nhận', value: new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at)) }))
      }
      setRows(next)
    } catch (error) {
      setRows([])
      setMessage(error instanceof Error ? error.message : 'Không thể tải dữ liệu quản trị.')
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer) }, [load])

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')
    return normalized ? rows.filter((row) => (row.primary + ' ' + row.secondary + ' ' + row.status).toLocaleLowerCase('vi').includes(normalized)) : rows
  }, [query, rows])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !editor) return
    const form = new FormData(event.currentTarget)
    const name = formText(form, 'name')
    const value = formText(form, 'value')
    const status = formText(form, 'status')
    let error: { message: string } | null

    if (editor === 'create') {
      if (section === 'products') ({ error } = await supabase.from('products').insert({ name, slug: name.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), status: 'draft' }))
      else if (section === 'discounts') ({ error } = await supabase.from('promotions').insert({ name, discount_type: 'fixed_amount', discount_value: Number(value) || 0, status: 'draft' }))
      else if (section === 'content') ({ error } = await supabase.from('content_sections').insert({ page_key: name || 'home', type: value || 'text', payload: {}, position: rows.length, active: false }))
      else return setMessage('Module này không hỗ trợ tạo mới trực tiếp.')
    } else if (section === 'products') ({ error } = await supabase.from('products').update({ status: status as 'draft' | 'published' | 'archived' }).eq('id', editor.id))
    else if (section === 'inventory') ({ error } = await supabase.from('inventory_items').update({ on_hand: Number(value) }).eq('variant_id', editor.id))
    else if (section === 'pricing') ({ error } = await supabase.from('product_variants').update({ price_amount: Number(value) }).eq('id', editor.id))
    else if (section === 'discounts') ({ error } = await supabase.from('promotions').update({ status: status as 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' }).eq('id', editor.id))
    else if (section === 'orders') ({ error } = await supabase.from('orders').update({ status: status as 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'partially_refunded' }).eq('id', editor.id))
    else if (section === 'members') ({ error } = await supabase.from('member_status').update({ status: status as 'active' | 'blocked', reason: status === 'blocked' ? 'Khóa từ HORIZ Administrator' : null }).eq('user_id', editor.id))
    else if (section === 'content') ({ error } = await supabase.from('content_sections').update({ active: status === 'active' }).eq('id', editor.id))
    else return setMessage('Module này chỉ hỗ trợ xem dữ liệu.')

    setMessage(error ? error.message : 'Đã lưu thay đổi.')
    if (!error) { setEditor(null); await load() }
  }

  const remove = async (row: AdminRow) => {
    if (!supabase || !window.confirm('Xóa mục “' + row.primary + '”?')) return
    let error: { message: string } | null
    if (section === 'products' && row.status !== 'published') ({ error } = await supabase.from('products').delete().eq('id', row.id))
    else if (section === 'discounts') ({ error } = await supabase.from('promotions').delete().eq('id', row.id))
    else if (section === 'content') ({ error } = await supabase.from('content_sections').delete().eq('id', row.id))
    else return setMessage('Chỉ bản nháp sản phẩm, chiết khấu và nội dung mới có thể xóa tại đây.')
    setMessage(error ? error.message : 'Đã xóa mục.')
    if (!error) await load()
  }

  const canCreate = ['products', 'discounts', 'content'].includes(section)
  const canDelete = ['products', 'discounts', 'content'].includes(section)
  const canEdit = section !== 'audit-logs'

  return (
    <main className="admin-main" id="main-content">
      <div className="admin-page-heading"><div><p className="eyebrow">HORIZ Administrator</p><h1>{label}</h1><p>{rows.length} bản ghi · dữ liệu Supabase theo quyền quản trị.</p></div>{canCreate ? <button className="button button--primary" onClick={() => setEditor('create')} type="button">Tạo mới <Plus aria-hidden="true" /></button> : null}</div>
      <section className="dashboard-panel admin-data-panel">
        <div className="admin-data-toolbar"><label><span className="sr-only">Tìm trong {label}</span><input onChange={(event) => setQuery(event.target.value)} placeholder={'Tìm trong ' + label.toLowerCase() + '…'} type="search" value={query} /></label><button aria-label="Tải lại" className="icon-button" onClick={() => void load()} type="button"><RefreshCw aria-hidden="true" /></button></div>
        {message ? <p className="form-message form-message--neutral" role="status">{message}</p> : null}
        {loading ? <p className="admin-empty">Đang tải dữ liệu…</p> : visibleRows.length === 0 ? <p className="admin-empty">Chưa có dữ liệu phù hợp.</p> : <div className="table-wrap"><table><thead><tr><th>{section === 'orders' ? 'Mã đơn' : label}</th><th>Thông tin</th><th>Trạng thái</th><th>Giá trị</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id}><td><strong>{row.primary}</strong></td><td><small>{row.secondary}</small></td><td><span className="status-badge">{row.status}</span></td><td>{row.value}</td><td><div className="row-actions">{canEdit ? <button aria-label={'Sửa ' + row.primary} onClick={() => setEditor(row)} type="button"><Edit3 aria-hidden="true" /></button> : null}{canDelete ? <button aria-label={'Xóa ' + row.primary} onClick={() => void remove(row)} type="button"><Trash2 aria-hidden="true" /></button> : null}</div></td></tr>)}</tbody></table></div>}
      </section>
      {editor ? <div aria-modal="true" className="dialog-backdrop" role="dialog"><form className="admin-editor" onSubmit={(event) => void save(event)}><button aria-label="Đóng" className="icon-button" onClick={() => setEditor(null)} type="button"><X aria-hidden="true" /></button><p className="eyebrow">{editor === 'create' ? 'Tạo bản ghi' : 'Cập nhật'}</p><h2>{editor === 'create' ? 'Thêm ' + label.toLowerCase() : editor.primary}</h2>{editor === 'create' ? <><label className="field"><span>{section === 'content' ? 'Khóa trang' : 'Tên'}</span><input name="name" required /></label>{section !== 'products' ? <label className="field"><span>{section === 'discounts' ? 'Giá trị giảm (₫)' : 'Loại nội dung'}</span><input name="value" required /></label> : null}</> : <EditorFields row={editor} section={section} />}<button className="button button--primary button--wide" type="submit">Lưu thay đổi <ArrowRight aria-hidden="true" /></button></form></div> : null}
    </main>
  )
}

function EditorFields({ row, section }: { row: AdminRow; section: string }) {
  if (section === 'inventory' || section === 'pricing') return <label className="field"><span>{section === 'inventory' ? 'Tồn thực tế' : 'Giá bán (₫)'}</span><input defaultValue={row.rawValue} min="0" name="value" required type="number" /></label>
  const options: Record<string, string[]> = {
    products: ['draft', 'published', 'archived'],
    discounts: ['draft', 'scheduled', 'active', 'paused', 'expired'],
    orders: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    members: ['active', 'blocked'],
    content: ['active', 'inactive'],
  }
  return <label className="field"><span>Trạng thái</span><select defaultValue={section === 'content' ? (row.status === 'Đang hiển thị' ? 'active' : 'inactive') : row.status} name="status">{(options[section] ?? []).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
}
