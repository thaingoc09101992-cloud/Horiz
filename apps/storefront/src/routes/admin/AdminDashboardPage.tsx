import { AlertTriangle, ArrowUpRight, Clock3, PackageX, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { formatVnd } from '../../lib/format'
import { supabase } from '../../lib/supabase'

type OrderRow = { id: string; status: string; payment_status: string; grand_total: number; created_at: string }
type InventoryRow = { on_hand: number; reserved: number; reorder_level: number; unit_cost: number | null }

function startForPeriod(period: string) {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === '7d') return new Date(Date.now() - 6 * 86400000)
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(Date.now() - 29 * 86400000)
}

export function AdminDashboardPage() {
  const [period, setPeriod] = useState('30d')
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const [{ data: orderData, error }, { data: inventoryData }] = await Promise.all([
      supabase.from('orders').select('id,status,payment_status,grand_total,created_at').gte('created_at', startForPeriod(period).toISOString()).order('created_at'),
      supabase.from('inventory_items').select('on_hand,reserved,reorder_level,unit_cost'),
    ])
    setOrders(orderData ?? [])
    setInventory(inventoryData ?? [])
    setMessage(error?.message ?? '')
    setLoading(false)
  }, [period])

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer) }, [load])

  const paidOrders = orders.filter((order) => order.payment_status === 'paid' || order.status !== 'cancelled')
  const revenue = paidOrders.reduce((sum, order) => sum + order.grand_total, 0)
  const average = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0
  const outOfStock = inventory.filter((item) => item.on_hand - item.reserved <= 0).length
  const lowStock = inventory.filter((item) => { const available = item.on_hand - item.reserved; return available > 0 && available <= item.reorder_level }).length
  const reserved = inventory.reduce((sum, item) => sum + item.reserved, 0)
  const stockValue = inventory.reduce((sum, item) => sum + item.on_hand * (item.unit_cost ?? 0), 0)

  const daily = useMemo(() => {
    const map = new Map<string, number>()
    orders.forEach((order) => { const key = order.created_at.slice(0, 10); map.set(key, (map.get(key) ?? 0) + order.grand_total) })
    const values = [...map.entries()].slice(-14)
    return values.length ? values : [[new Date().toISOString().slice(0, 10), 0] as [string, number]]
  }, [orders])
  const maxDaily = Math.max(1, ...daily.map(([, value]) => value))
  const statuses = useMemo(() => orders.reduce<Record<string, number>>((result, order) => ({ ...result, [order.status]: (result[order.status] ?? 0) + 1 }), {}), [orders])

  return (
    <main className="admin-main" id="main-content">
      <div className="admin-page-heading"><div><p className="eyebrow">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date())}</p><h1>Tình hình kinh doanh</h1><p>{loading ? 'Đang cập nhật dữ liệu…' : 'Dữ liệu Supabase · múi giờ Asia/Ho_Chi_Minh'}</p></div><select aria-label="Khoảng thời gian dashboard" onChange={(event) => setPeriod(event.target.value)} value={period}><option value="today">Hôm nay</option><option value="7d">7 ngày qua</option><option value="30d">30 ngày qua</option><option value="month">Tháng này</option></select></div>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <section aria-label="Chỉ số bán hàng" className="kpi-grid">
        {[['Doanh thu', formatVnd(revenue)], ['Đơn hàng', String(paidOrders.length)], ['Giá trị đơn TB', formatVnd(average)]].map(([label, value]) => <article className="stat-card" key={label}><div className="stat-card__label"><span>{label}</span><WalletCards aria-hidden="true" /></div><strong>{value}</strong><p className="trend trend--up"><ArrowUpRight aria-hidden="true" /><span>Trong kỳ đã chọn</span></p></article>)}
      </section>
      <section aria-label="Cảnh báo tồn kho" className="stock-alert-grid">
        <article className="stock-alert stock-alert--danger"><PackageX aria-hidden="true" /><div><span>SKU hết hàng</span><strong>{outOfStock}</strong></div><Link to="/admin/inventory">Xử lý</Link></article>
        <article className="stock-alert stock-alert--warning"><AlertTriangle aria-hidden="true" /><div><span>SKU sắp hết</span><strong>{lowStock}</strong></div><Link to="/admin/inventory">Xử lý</Link></article>
        <article className="stock-alert stock-alert--neutral"><Clock3 aria-hidden="true" /><div><span>Đang giữ chỗ</span><strong>{reserved}</strong></div><Link to="/admin/inventory">Xử lý</Link></article>
      </section>
      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel--wide"><div className="panel-heading"><div><h2>Doanh thu theo ngày</h2><p>{daily.length} ngày có dữ liệu trong kỳ</p></div></div><div aria-label="Biểu đồ doanh thu theo ngày" className="sales-chart" role="img">{daily.map(([date, value]) => <div className="sales-chart__column" key={date}><span className="sales-chart__value">{Math.round(value / 1000000)}</span><span className="sales-chart__bar" style={{ height: String(Math.round((value / maxDaily) * 100)) + '%' }} /><small>{date.slice(8)}</small></div>)}</div></section>
        <section className="dashboard-panel"><div className="panel-heading"><div><h2>Trạng thái đơn</h2><p>{orders.length} đơn trong kỳ</p></div></div><ul className="status-list">{Object.entries(statuses).map(([status, count]) => <li key={status}><span>{status}</span><strong>{count}</strong></li>)}{orders.length === 0 ? <li><span>Chưa có đơn</span><strong>0</strong></li> : null}</ul></section>
        <section className="dashboard-panel dashboard-panel--wide"><div className="panel-heading"><div><h2>Hành động cần xử lý</h2><p>Ưu tiên theo mức ảnh hưởng vận hành</p></div></div><div className="dashboard-actions"><Link to="/admin/orders"><strong>{orders.filter((order) => ['pending_payment', 'paid', 'processing'].includes(order.status)).length}</strong><span>Đơn cần xử lý</span></Link><Link to="/admin/inventory"><strong>{outOfStock + lowStock}</strong><span>SKU cần bổ sung</span></Link><Link to="/admin/products"><strong>{inventory.length}</strong><span>SKU đang theo dõi</span></Link></div></section>
        <section className="dashboard-panel"><div className="panel-heading"><div><h2>Giá trị tồn kho</h2><p>Theo giá vốn hiện có</p></div></div><strong className="inventory-value">{formatVnd(stockValue)}</strong><p className="panel-footnote">{inventory.reduce((sum, item) => sum + item.on_hand, 0)} sản phẩm thực tế · {reserved} đang reserve</p></section>
      </div>
    </main>
  )
}
