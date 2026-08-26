import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

const root = process.cwd()
const sourceDir = join(root, 'Source')
const manifestPath = join(sourceDir, 'Allbirds_Images_Manifest.csv')
const trackingPath = join(sourceDir, 'Danh_muc_san_pham_dung_web.csv')
const imageSourceRoot = join(sourceDir, 'Hinh anh', 'Allbirds_Images')
const imageOutputRoot = join(root, 'apps', 'storefront', 'public', 'catalogue')
const dataOutputPath = join(root, 'apps', 'storefront', 'src', 'data', 'catalogue.generated.json')
// No per-category cap — every product in the manifest ships to the site.
const productsPerGroup = Infinity

const lines = readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/)
const sourceHeaders = lines.shift().split(',')
const sourceRows = lines.map((line) => Object.fromEntries(line.split(',').map((value, index) => [sourceHeaders[index], value])))
  .filter((row) => row.Danh_muc_chinh && row.Danh_muc_chinh !== 'Homepage')

const productGroups = new Map()
for (const row of sourceRows) {
  const productKey = `${row.Danh_muc_chinh}/${row.Danh_muc_phu}/${row.San_pham}`
  const product = productGroups.get(productKey) ?? { key: productKey, rows: [] }
  product.rows.push(row)
  productGroups.set(productKey, product)
}

const selectedKeys = new Set()
const selectedOrder = new Map()
const categoryCounts = new Map()
for (const product of productGroups.values()) {
  const first = product.rows[0]
  const categoryKey = `${first.Danh_muc_chinh}/${first.Danh_muc_phu}`
  const current = categoryCounts.get(categoryKey) ?? 0
  if (current < productsPerGroup) {
    selectedKeys.add(product.key)
    selectedOrder.set(product.key, current + 1)
    categoryCounts.set(categoryKey, current + 1)
  }
}

const titleCase = (slug) => slug
  .replace(/allbirds/gi, 'HORIZ')
  .replace(/mens|womens/gi, '')
  .split('-').filter(Boolean)
  .map((word) => word === 'HORIZ' ? word : word[0].toUpperCase() + word.slice(1))
  .join(' ')
const safeId = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

mkdirSync(imageOutputRoot, { recursive: true })
mkdirSync(dirname(dataOutputPath), { recursive: true })

const products = []
const trackingRows = []
for (const product of productGroups.values()) {
  if (!selectedKeys.has(product.key)) continue
  const first = product.rows[0]
  const id = safeId(product.key)
  const images = product.rows.map((row, index) => {
    const extension = basename(row.Duong_dan_tuong_doi).split('.').pop().toLowerCase()
    const publicName = `${id}-${String(index + 1).padStart(2, '0')}.${extension}`
    const sourcePath = join(imageSourceRoot, ...row.Duong_dan_tuong_doi.split('/'))
    if (!existsSync(sourcePath)) throw new Error(`Không tìm thấy ảnh: ${sourcePath}`)
    copyFileSync(sourcePath, join(imageOutputRoot, publicName))
    return `/catalogue/${publicName}`
  })

  products.push({
    id,
    slug: first.San_pham,
    name: titleCase(first.San_pham),
    audience: first.Danh_muc_chinh,
    category: first.Danh_muc_phu,
    price: Number(first.Gia_VND.replace(/\D/g, '')),
    image: images[0],
    images,
    imageCount: product.rows.length,
  })

  for (const [index, row] of product.rows.entries()) {
    trackingRows.push({
      ...row,
      Ma_san_pham_web: id,
      Ten_hien_thi_web: titleCase(first.San_pham),
      Thu_tu_trong_danh_muc: selectedOrder.get(product.key),
      Anh_dai_dien: row === first ? 'TRUE' : 'FALSE',
      So_luong_anh: product.rows.length,
      Duong_dan_web: images[index],
      Trang_thai: 'PROTOTYPE_ONLY',
    })
  }
}

writeFileSync(dataOutputPath, `${JSON.stringify(products, null, 2)}\n`)
const selectedFiles = new Set(products.flatMap((product) => product.images.map((image) => basename(image))))
for (const file of readdirSync(imageOutputRoot)) {
  if (!selectedFiles.has(file)) unlinkSync(join(imageOutputRoot, file))
}
const extraHeaders = ['Ma_san_pham_web', 'Ten_hien_thi_web', 'Thu_tu_trong_danh_muc', 'Anh_dai_dien', 'So_luong_anh', 'Duong_dan_web', 'Trang_thai']
const outputHeaders = [...sourceHeaders, ...extraHeaders]
const csv = [outputHeaders.map(csvCell).join(','), ...trackingRows.map((row) => outputHeaders.map((header) => csvCell(row[header])).join(','))].join('\r\n')
writeFileSync(trackingPath, `\uFEFF${csv}\r\n`)

console.log(`Đã chọn ${products.length} sản phẩm, ${trackingRows.length} ảnh từ ${categoryCounts.size} nhóm danh mục.`)
