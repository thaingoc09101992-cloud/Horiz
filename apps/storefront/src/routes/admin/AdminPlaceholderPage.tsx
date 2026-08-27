import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, ChevronDown, Edit3, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { Portal } from '../../components/feedback/Portal'
import { formatVnd } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { AdminImportTools, type ImportSection } from './AdminImportTools'
import { orderStatusLabels } from './adminLabels'
import { invokeAdminTools } from './adminTools'

type AdminRow = {
  id: string
  primary: string
  secondary: string
  status: string
  value: string
  imageUrl?: string
  rawValue?: number
  roleValue?: string
  statusValue?: string
  isNew?: boolean
  sortValue?: number
}

type SortKey = 'primary' | 'status' | 'value'
type SortState = { key: SortKey; dir: 'asc' | 'desc' }

// The "Giá trị" column holds a plain string for some sections and a number/date
// for others; the numeric ones sort on row.sortValue instead of the label text.
const numericValueSections = new Set(['inventory', 'pricing', 'orders', 'discounts', 'content', 'audit-logs'])

type OrderItemRow = {
  id: string
  image_url: string | null
  line_total: number
  product_name: string
  quantity: number
  sku: string
  unit_price: number
  variant_name: string
}

const sectionLabels: Record<string, string> = {
  products: 'Sản phẩm', inventory: 'Tồn kho', pricing: 'Giá bán', discounts: 'Chiết khấu',
  orders: 'Đơn hàng', members: 'Thành viên', content: 'Nội dung', 'audit-logs': 'Nhật ký hoạt động',
}

const sectionDescriptions: Record<string, string> = {
  products: 'Quản lý danh mục, hình ảnh và trạng thái hiển thị của sản phẩm.',
  inventory: 'Theo dõi tồn thực tế, lượng khả dụng và ngưỡng cảnh báo theo từng SKU.',
  pricing: 'Kiểm soát giá bán và giá so sánh của từng biến thể sản phẩm.',
  discounts: 'Thiết lập chương trình ưu đãi, thời gian áp dụng và trạng thái khuyến mãi.',
  orders: 'Theo dõi đơn hàng, sản phẩm đã mua và cập nhật tiến trình xử lý.',
  members: 'Tạo tài khoản, phân quyền và quản lý trạng thái hoạt động của thành viên.',
  content: 'Quản lý các khối nội dung và trạng thái hiển thị trên cửa hàng.',
  'audit-logs': 'Tra cứu lịch sử hoạt động và các thay đổi trong hệ thống.',
}

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  customer: 'Khách hàng',
  staff: 'Nhân viên',
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
  const [sort, setSort] = useState<SortState | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editor, setEditor] = useState<AdminRow | 'create' | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, OrderItemRow[]>>({})

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setMessage('')
    try {
      let next: AdminRow[] = []
      if (section === 'products') {
        const { data, error } = await supabase.from('products').select('id,name,slug,source_key,status,featured,updated_at').order('updated_at', { ascending: false }).limit(200)
        if (error) throw error
        next = (data ?? []).map((item) => ({
          id: item.id,
          primary: item.name,
          secondary: item.slug,
          status: item.status,
          value: item.featured ? 'Nổi bật' : 'Tiêu chuẩn',
          imageUrl: item.source_key ? '/catalogue/' + item.source_key + '-01.jpg' : undefined,
        }))
      } else if (section === 'inventory') {
        const { data, error } = await supabase.from('inventory_items').select('variant_id,on_hand,reserved,reorder_level,product_variants(sku,title,products(name,source_key))').order('updated_at', { ascending: false }).limit(250)
        if (error) throw error
        next = (data ?? []).map((item) => { const variant = nestedRecord(item.product_variants); const product = nestedRecord(variant.products); const available = item.on_hand - item.reserved; const sourceKey = readText(product.source_key); return { id: item.variant_id, primary: readText(product.name, readText(variant.sku, 'SKU')), secondary: readText(variant.sku) + ' · ' + readText(variant.title), status: available <= 0 ? 'Hết hàng' : available <= item.reorder_level ? 'Sắp hết' : 'Ổn định', value: String(available) + ' khả dụng', imageUrl: sourceKey ? '/catalogue/' + sourceKey + '-01.jpg' : undefined, rawValue: item.on_hand, sortValue: available } })
      } else if (section === 'pricing') {
        const { data, error } = await supabase.from('product_variants').select('id,sku,title,price_amount,compare_at_amount,products(name,source_key)').order('updated_at', { ascending: false }).limit(250)
        if (error) throw error
        next = (data ?? []).map((item) => { const product = nestedRecord(item.products); const sourceKey = readText(product.source_key); return { id: item.id, primary: readText(product.name, item.sku), secondary: item.sku + ' · ' + item.title, status: item.compare_at_amount ? 'Đang giảm' : 'Giá thường', value: formatVnd(item.price_amount), imageUrl: sourceKey ? '/catalogue/' + sourceKey + '-01.jpg' : undefined, rawValue: item.price_amount, sortValue: item.price_amount } })
      } else if (section === 'discounts') {
        const { data, error } = await supabase.from('promotions').select('id,name,status,discount_type,discount_value,starts_at,ends_at').order('created_at', { ascending: false })
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: item.id, primary: item.name, secondary: item.discount_type === 'percentage' ? String(item.discount_value / 100) + '%' : formatVnd(item.discount_value), status: item.status, value: item.starts_at ? new Intl.DateTimeFormat('vi-VN').format(new Date(item.starts_at)) : 'Chưa lên lịch', sortValue: item.starts_at ? new Date(item.starts_at).getTime() : 0 }))
      } else if (section === 'orders') {
        const { data, error } = await supabase.from('orders').select('id,order_number,email,status,grand_total,created_at,opened_at').order('created_at', { ascending: false }).limit(200)
        if (error) throw error
        next = (data ?? []).map((item) => {
          const isNew = !item.opened_at && item.status === 'pending_payment'
          return { id: item.id, primary: item.order_number, secondary: item.email, status: isNew ? 'Đơn mới' : orderStatusLabels[item.status] ?? item.status, statusValue: item.status, value: formatVnd(item.grand_total), rawValue: item.grand_total, sortValue: item.grand_total, isNew }
        })
      } else if (section === 'members') {
        const [profileResult, statusResult, roleResult] = await Promise.all([
          supabase.from('profiles').select('id,email,full_name,phone,created_at').order('created_at', { ascending: false }).limit(200),
          supabase.from('member_status').select('user_id,status'),
          supabase.from('user_roles').select('user_id,role,revoked_at').is('revoked_at', null),
        ])
        if (profileResult.error) throw profileResult.error
        if (statusResult.error) throw statusResult.error
        if (roleResult.error) throw roleResult.error
        const statuses = new Map((statusResult.data ?? []).map((item) => [item.user_id, item.status]))
        const roles = new Map((roleResult.data ?? []).map((item) => [item.user_id, item.role]))
        next = (profileResult.data ?? []).map((item) => ({
          id: item.id,
          primary: item.full_name || item.email || 'Thành viên HORIZ',
          secondary: item.full_name ? [item.email, item.phone].filter(Boolean).join(' · ') : item.phone || 'Tài khoản khách hàng',
          status: statuses.get(item.id) ?? 'active',
          value: roleLabels[roles.get(item.id) ?? 'customer'] ?? 'Khách hàng',
          roleValue: roles.get(item.id) ?? 'customer',
        }))
      } else if (section === 'content') {
        const { data, error } = await supabase.from('content_sections').select('id,page_key,type,active,position,updated_at').order('page_key').order('position')
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: item.id, primary: item.page_key, secondary: item.type + ' · vị trí ' + String(item.position), status: item.active ? 'Đang hiển thị' : 'Đã ẩn', value: new Intl.DateTimeFormat('vi-VN').format(new Date(item.updated_at)), sortValue: new Date(item.updated_at).getTime() }))
      } else {
        const { data, error } = await supabase.from('audit_logs').select('id,action,entity_type,actor_id,created_at').order('created_at', { ascending: false }).limit(250)
        if (error) throw error
        next = (data ?? []).map((item) => ({ id: String(item.id), primary: item.action.toUpperCase() + ' · ' + item.entity_type, secondary: item.actor_id ?? 'Hệ thống', status: 'Đã ghi nhận', value: new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.created_at)), sortValue: new Date(item.created_at).getTime() }))
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

  // Sorting is section-specific — drop it on navigation (state reset during
  // render, per the React "changing state on prop change" pattern).
  const [sortedSection, setSortedSection] = useState(section)
  if (section !== sortedSection) {
    setSortedSection(section)
    setSort(null)
  }

  const collator = useMemo(() => new Intl.Collator('vi', { numeric: true, sensitivity: 'base' }), [])

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')
    const filtered = normalized
      ? rows.filter((row) => (row.primary + ' ' + row.secondary + ' ' + row.status).toLocaleLowerCase('vi').includes(normalized))
      : rows
    if (!sort) return filtered
    const factor = sort.dir === 'asc' ? 1 : -1
    const numericValue = sort.key === 'value' && numericValueSections.has(section)
    return [...filtered].sort((a, b) => {
      if (numericValue) return factor * ((a.sortValue ?? 0) - (b.sortValue ?? 0))
      const av = sort.key === 'primary' ? a.primary : sort.key === 'status' ? a.status : a.value
      const bv = sort.key === 'primary' ? b.primary : sort.key === 'status' ? b.status : b.value
      return factor * collator.compare(av, bv)
    })
  }, [query, rows, sort, section, collator])

  const handleSort = (key: SortKey) => {
    setSort((current) => (current?.key !== key ? { key, dir: 'asc' } : current.dir === 'asc' ? { key, dir: 'desc' } : null))
  }

  // First time an admin opens a "Đơn mới" order (detail row or editor), stamp
  // opened_at and move it into "Đang xử lý".
  const markOrderOpened = async (orderId: string) => {
    if (!supabase) return
    if (!rows.find((row) => row.id === orderId)?.isNew) return
    setRows((current) => current.map((row) => (
      row.id === orderId ? { ...row, isNew: false, statusValue: 'processing', status: orderStatusLabels.processing ?? 'Đang xử lý' } : row
    )))
    const { error } = await supabase.from('orders').update({ opened_at: new Date().toISOString(), status: 'processing' }).eq('id', orderId).is('opened_at', null)
    if (error) { setMessage(error.message); void load() }
  }

  const toggleOrderDetails = async (orderId: string) => {
    if (!supabase) return
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
      return
    }
    setExpandedOrderId(orderId)
    void markOrderOpened(orderId)
    if (orderItems[orderId]) return

    setLoadingOrderId(orderId)
    const { data, error } = await supabase.from('order_items').select('id,image_url,line_total,product_name,quantity,sku,unit_price,variant_name').eq('order_id', orderId)
    setLoadingOrderId(null)
    if (error) {
      setMessage(error.message)
      return
    }
    setOrderItems((current) => ({ ...current, [orderId]: data ?? [] }))
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !editor) return
    const form = new FormData(event.currentTarget)
    const name = formText(form, 'name')
    const value = formText(form, 'value')
    const status = formText(form, 'status')
    const role = formText(form, 'role')
    let error: { message: string } | null

    if (editor === 'create') {
      if (section === 'products') {
        try {
          await invokeAdminTools({ action: 'import_products', rows: [{ featured: false, name, slug: name.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), status: 'draft' }] })
          error = null
        } catch (productError) {
          error = { message: productError instanceof Error ? productError.message : 'Không thể tạo sản phẩm.' }
        }
      }
      else if (section === 'discounts') ({ error } = await supabase.from('promotions').insert({ name, discount_type: 'fixed_amount', discount_value: Number(value) || 0, status: 'draft' }))
      else if (section === 'content') ({ error } = await supabase.from('content_sections').insert({ page_key: name || 'home', type: value || 'text', payload: {}, position: rows.length, active: false }))
      else if (section === 'members') {
        try {
          await invokeAdminTools({ action: 'create_member', email: formText(form, 'email'), full_name: formText(form, 'full_name'), password: formText(form, 'password'), role })
          error = null
        } catch (memberError) {
          error = { message: memberError instanceof Error ? memberError.message : 'Không thể tạo thành viên.' }
        }
      }
      else return setMessage('Module này không hỗ trợ tạo mới trực tiếp.')
    } else if (section === 'products') ({ error } = await supabase.from('products').update({ status: status as 'draft' | 'published' | 'archived' }).eq('id', editor.id))
    else if (section === 'inventory') ({ error } = await supabase.from('inventory_items').update({ on_hand: Number(value) }).eq('variant_id', editor.id))
    else if (section === 'pricing') ({ error } = await supabase.from('product_variants').update({ price_amount: Number(value) }).eq('id', editor.id))
    else if (section === 'discounts') ({ error } = await supabase.from('promotions').update({ status: status as 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' }).eq('id', editor.id))
    else if (section === 'orders') ({ error } = await supabase.from('orders').update({ status: status as 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'partially_refunded' }).eq('id', editor.id))
    else if (section === 'members') {
      try {
        await invokeAdminTools({ action: 'update_member', role, status, user_id: editor.id })
        error = null
      } catch (memberError) {
        error = { message: memberError instanceof Error ? memberError.message : 'Không thể cập nhật thành viên.' }
      }
    }
    else if (section === 'content') ({ error } = await supabase.from('content_sections').update({ active: status === 'active' }).eq('id', editor.id))
    else return setMessage('Module này chỉ hỗ trợ xem dữ liệu.')

    if (error) setMessage(error.message)
    else { setEditor(null); await load(); setMessage('Đã lưu thay đổi.') }
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

  const canCreate = ['products', 'discounts', 'members', 'content'].includes(section)
  const canDelete = ['products', 'discounts', 'content'].includes(section)
  const canEdit = section !== 'audit-logs'
  const showsProductImages = ['products', 'inventory', 'pricing'].includes(section)
  const supportsImport = ['products', 'inventory', 'pricing'].includes(section)
  const primaryLabel = section === 'orders' ? 'Mã đơn' : label

  return (
    <main className="admin-main" id="main-content">
      <div className="admin-page-heading"><div><p className="eyebrow">HORIZ Administrator</p><h1>{label}</h1><p>{sectionDescriptions[section] ?? 'Quản lý dữ liệu hệ thống.'} · {rows.length} bản ghi.</p></div><div className="admin-heading-actions">{supportsImport ? <AdminImportTools onImported={load} section={section as ImportSection} setMessage={setMessage} /> : null}{canCreate ? <button className="button button--primary" onClick={() => setEditor('create')} type="button">Tạo mới <Plus aria-hidden="true" /></button> : null}</div></div>
      <section className="dashboard-panel admin-data-panel">
        <div className="admin-data-toolbar"><label><span className="sr-only">Tìm trong {label}</span><input onChange={(event) => setQuery(event.target.value)} placeholder={'Tìm trong ' + label.toLowerCase() + '…'} type="search" value={query} /></label><button aria-label="Tải lại" className="icon-button" onClick={() => void load()} type="button"><RefreshCw aria-hidden="true" /></button></div>
        {message ? <p className="form-message form-message--neutral" role="status">{message}</p> : null}
        {loading ? <p className="admin-empty">Đang tải dữ liệu…</p> : <div className="table-wrap"><table className={showsProductImages ? 'admin-table admin-table--products' : 'admin-table'}><thead><tr>{showsProductImages ? <th className="admin-image-column">Ảnh</th> : null}<SortableHeader label={primaryLabel} onSort={() => handleSort('primary')} sort={sort} sortKey="primary" /><SortableHeader label="Trạng thái" onSort={() => handleSort('status')} sort={sort} sortKey="status" /><SortableHeader label="Giá trị" onSort={() => handleSort('value')} sort={sort} sortKey="value" /><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{visibleRows.length === 0 ? <tr><td colSpan={showsProductImages ? 5 : 4}><p className="admin-empty">Chưa có dữ liệu phù hợp.</p></td></tr> : visibleRows.map((row) => <Fragment key={row.id}><tr>{showsProductImages ? <td className="admin-image-column"><ProductThumbnail name={row.primary} src={row.imageUrl} /></td> : null}<td><strong>{row.primary}</strong></td><td><span className={row.isNew ? 'status-badge status-badge--new' : 'status-badge'}>{row.status}</span></td><td>{row.value}</td><td><div className="row-actions">{section === 'orders' ? <button aria-expanded={expandedOrderId === row.id} className="row-detail-button" onClick={() => void toggleOrderDetails(row.id)} type="button">Chi tiết <ChevronDown aria-hidden="true" /></button> : null}{canEdit ? <button aria-label={'Sửa ' + row.primary} onClick={() => { if (section === 'orders') void markOrderOpened(row.id); setEditor(row) }} type="button"><Edit3 aria-hidden="true" /></button> : null}{canDelete ? <button aria-label={'Xóa ' + row.primary} onClick={() => void remove(row)} type="button"><Trash2 aria-hidden="true" /></button> : null}</div></td></tr>{section === 'orders' && expandedOrderId === row.id ? <tr className="order-detail-row"><td colSpan={4}><OrderDetails items={orderItems[row.id] ?? []} loading={loadingOrderId === row.id} /></td></tr> : null}</Fragment>)}</tbody></table></div>}
      </section>
      {editor ? <Portal><div aria-modal="true" className="dialog-backdrop" role="dialog"><form className="admin-editor" onSubmit={(event) => void save(event)}><button aria-label="Đóng" className="icon-button" onClick={() => setEditor(null)} type="button"><X aria-hidden="true" /></button><p className="eyebrow">{editor === 'create' ? 'Tạo bản ghi' : 'Cập nhật'}</p><h2>{editor === 'create' ? 'Thêm ' + label.toLowerCase() : editor.primary}</h2>{editor === 'create' ? <CreateFields section={section} /> : <EditorFields row={editor} section={section} />}<button className="button button--primary button--wide" type="submit">Lưu thay đổi <ArrowRight aria-hidden="true" /></button></form></div></Portal> : null}
    </main>
  )
}

function SortableHeader({ label, sortKey, sort, onSort }: {
  label: string
  sortKey: SortKey
  sort: SortState | null
  onSort: () => void
}) {
  const active = sort?.key === sortKey
  const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button className="admin-th-sort" data-active={active || undefined} onClick={onSort} type="button">
        {label}<SortIcon aria-hidden="true" />
      </button>
    </th>
  )
}

function ProductThumbnail({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span className="admin-product-image">
      {src && !failed
        ? <img alt={name} height="64" loading="lazy" onError={() => setFailed(true)} src={src} width="64" />
        : <span aria-hidden="true">H</span>}
    </span>
  )
}

function OrderDetails({ items, loading }: { items: OrderItemRow[]; loading: boolean }) {
  if (loading) return <p className="order-detail-message">Đang tải chi tiết đơn hàng…</p>
  if (!items.length) return <p className="order-detail-message">Đơn hàng chưa có sản phẩm.</p>

  return (
    <div className="order-detail-list">
      {items.map((item) => (
        <article className="order-detail-item" key={item.id}>
          <ProductThumbnail name={item.product_name} src={item.image_url ?? undefined} />
          <div><strong>{item.product_name}</strong><span>{item.variant_name} · {item.sku}</span></div>
          <span>Số lượng: {item.quantity}</span>
          <div className="order-detail-price"><strong>{formatVnd(item.line_total)}</strong><span>{formatVnd(item.unit_price)} / sản phẩm</span></div>
        </article>
      ))}
    </div>
  )
}

function CreateFields({ section }: { section: string }) {
  if (section === 'members') {
    return (
      <>
        <label className="field"><span>Họ và tên</span><input autoComplete="name" name="full_name" required /></label>
        <label className="field"><span>Email</span><input autoComplete="email" name="email" required type="email" /></label>
        <label className="field"><span>Mật khẩu</span><input autoComplete="new-password" minLength={8} name="password" required type="password" /></label>
        <label className="field"><span>Phân quyền</span><select defaultValue="customer" name="role"><option value="customer">Khách hàng</option><option value="staff">Nhân viên</option><option value="admin">Quản trị viên</option></select></label>
      </>
    )
  }

  return (
    <>
      <label className="field"><span>{section === 'content' ? 'Khóa trang' : 'Tên'}</span><input name="name" required /></label>
      {section !== 'products' ? <label className="field"><span>{section === 'discounts' ? 'Giá trị giảm (₫)' : 'Loại nội dung'}</span><input name="value" required /></label> : null}
    </>
  )
}

function EditorFields({ row, section }: { row: AdminRow; section: string }) {
  if (section === 'inventory' || section === 'pricing') return <label className="field"><span>{section === 'inventory' ? 'Tồn thực tế' : 'Giá bán (₫)'}</span><input defaultValue={row.rawValue} min="0" name="value" required type="number" /></label>
  if (section === 'members') return <><label className="field"><span>Trạng thái</span><select defaultValue={row.status} name="status"><option value="active">Đang hoạt động</option><option value="blocked">Đã khóa</option></select></label><label className="field"><span>Phân quyền</span><select defaultValue={row.roleValue ?? 'customer'} name="role"><option value="customer">Khách hàng</option><option value="staff">Nhân viên</option><option value="admin">Quản trị viên</option></select></label></>
  const options: Record<string, string[]> = {
    products: ['draft', 'published', 'archived'],
    discounts: ['draft', 'scheduled', 'active', 'paused', 'expired'],
    orders: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    members: ['active', 'blocked'],
    content: ['active', 'inactive'],
  }
  const defaultValue = section === 'content' ? (row.status === 'Đang hiển thị' ? 'active' : 'inactive') : row.statusValue ?? row.status
  return <label className="field"><span>Trạng thái</span><select defaultValue={defaultValue} name="status">{(options[section] ?? []).map((value) => <option key={value} value={value}>{section === 'orders' ? orderStatusLabels[value] ?? value : value}</option>)}</select></label>
}
