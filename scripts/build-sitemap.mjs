import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const origin = (process.env.SITE_URL || 'https://horiz.vn').replace(/\/$/, '')
const products = JSON.parse(readFileSync(join(root, 'apps/storefront/src/data/catalogue.generated.json'), 'utf8'))
// Keep in sync with the noindex decisions in apps/storefront/src/lib/seo.ts —
// /search is intentionally excluded (internal search results, noindex) and
// only the two curated /collections/* routes are listed (any other
// /collections/:slug is an unrecognized fallback that CataloguePage marks
// noindex to avoid duplicate-content URLs).
const staticRoutes = ['/', '/women', '/men', '/unisex', '/toddler', '/collections/new', '/collections/best-sellers', '/about', '/materials', '/help', '/returns', '/privacy', '/terms']
const routes = [...staticRoutes, ...products.map((product) => '/products/' + product.id)]
const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...routes.map((route) => '  <url><loc>' + origin + route + '</loc><changefreq>' + (route.startsWith('/products/') ? 'weekly' : 'monthly') + '</changefreq></url>'), '</urlset>', ''].join('\n')
writeFileSync(join(root, 'apps/storefront/public/sitemap.xml'), xml)
console.log('Generated sitemap with ' + String(routes.length) + ' URLs for ' + origin)
