import { Download, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import type { CellValue } from 'read-excel-file/browser'
import { invokeAdminTools } from './adminTools'

export type ImportSection = 'products' | 'inventory' | 'pricing'

const importConfig: Record<ImportSection, {
  action: string
  requiredHeaders: string[]
  template: string
}> = {
  products: {
    action: 'import_products',
    requiredHeaders: ['slug', 'name', 'status', 'featured'],
    template: '/import-templates/horiz-san-pham.xlsx',
  },
  inventory: {
    action: 'import_inventory',
    requiredHeaders: ['sku', 'on_hand', 'reorder_level'],
    template: '/import-templates/horiz-ton-kho.xlsx',
  },
  pricing: {
    action: 'import_pricing',
    requiredHeaders: ['sku', 'price_amount', 'compare_at_amount'],
    template: '/import-templates/horiz-gia-ban.xlsx',
  },
}

function cellText(value: CellValue | null) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function normalizeHeader(value: CellValue | null) {
  return cellText(value).toLocaleLowerCase('en-US')
}

function toSerializableCell(value: CellValue | null): string | number | boolean | null {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : null
}

export function AdminImportTools({
  onImported,
  section,
  setMessage,
}: {
  onImported: () => Promise<void>
  section: ImportSection
  setMessage: (message: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const config = importConfig[section]

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImporting(true)
    setMessage('')
    try {
      const { readSheet } = await import('read-excel-file/browser')
      const rows = await readSheet(file)
      if (rows.length < 2) throw new Error('File Excel chưa có dòng dữ liệu.')

      const headerRow = rows[0]
      if (!headerRow) throw new Error('File Excel chưa có dòng tiêu đề.')
      const headers = headerRow.map(normalizeHeader)
      const missingHeaders = config.requiredHeaders.filter((header) => !headers.includes(header))
      if (missingHeaders.length) throw new Error('Thiếu cột bắt buộc: ' + missingHeaders.join(', '))

      const records = rows.slice(1)
        .filter((row) => row.some((cell) => cellText(cell) !== ''))
        .map((row) => Object.fromEntries(headers.map((header, index) => [header, toSerializableCell(row[index] ?? null)])))

      if (!records.length) throw new Error('File Excel chưa có dòng dữ liệu hợp lệ.')
      if (records.length > 500) throw new Error('Mỗi lần chỉ import tối đa 500 dòng.')

      const result = await invokeAdminTools({ action: config.action, rows: records }) as { missing?: string[]; updated?: number }
      const missing = result.missing?.length ? ' Không tìm thấy: ' + result.missing.join(', ') + '.' : ''
      await onImported()
      setMessage('Đã import ' + String(result.updated ?? records.length) + ' dòng.' + missing)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể đọc file Excel.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="admin-import-tools">
      <a className="button button--secondary" download href={config.template}>
        Tải file mẫu <Download aria-hidden="true" />
      </a>
      <button className="button button--primary" disabled={importing} onClick={() => inputRef.current?.click()} type="button">
        {importing ? 'Đang import…' : 'Import Excel'} <Upload aria-hidden="true" />
      </button>
      <input accept=".xlsx" className="sr-only" onChange={(event) => void importFile(event)} ref={inputRef} type="file" />
    </div>
  )
}
