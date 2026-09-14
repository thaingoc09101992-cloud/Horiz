import { useEffect } from 'react'

export const SITE_NAME = 'HORIZ'
export const SITE_ORIGIN = 'https://horiz.vn'

export type SeoJsonLd = Record<string, unknown> & { '@context': string; '@type': string }

export interface SeoMetaOptions {
  /** Full <title> text, e.g. "Áo Nam | HORIZ". */
  title: string
  description: string
  /** Root-relative path used to build the canonical URL and og:url, e.g. "/products/abc". */
  path: string
  /** Marks the page as noindex,follow — for utility pages with no search-intent value. */
  noindex?: boolean
  /** Root-relative or absolute image URL for og:image / twitter:image. */
  image?: string
  jsonLd?: SeoJsonLd | SeoJsonLd[]
}

function absoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : SITE_ORIGIN + pathOrUrl
}

function getOrCreateMeta(attribute: 'name' | 'property', key: string): HTMLMetaElement {
  const existing = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (existing) return existing
  const created = document.createElement('meta')
  created.setAttribute(attribute, key)
  document.head.append(created)
  return created
}

/**
 * Applies per-route <title>, meta description, canonical link, robots, Open
 * Graph/Twitter tags and JSON-LD — then restores the previous document head
 * state on unmount. This is a pure client-rendered SPA (see wrangler.jsonc),
 * so this only helps crawlers that execute JavaScript; it cannot substitute
 * for server-rendered metadata.
 */
export function useSeoMeta(options: SeoMetaOptions): void {
  const { title, description, path, noindex = false, image, jsonLd } = options
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const descriptionMeta = getOrCreateMeta('name', 'description')
    const previousDescription = descriptionMeta.content
    descriptionMeta.content = description

    const canonicalHref = absoluteUrl(path)
    const canonicalLink = document.createElement('link')
    canonicalLink.rel = 'canonical'
    canonicalLink.href = canonicalHref
    document.head.append(canonicalLink)

    const robotsMeta = document.createElement('meta')
    robotsMeta.name = 'robots'
    robotsMeta.content = noindex ? 'noindex, follow' : 'index, follow'
    document.head.append(robotsMeta)

    const ogTitle = getOrCreateMeta('property', 'og:title')
    const previousOgTitle = ogTitle.content
    ogTitle.content = title

    const ogDescription = getOrCreateMeta('property', 'og:description')
    const previousOgDescription = ogDescription.content
    ogDescription.content = description

    const ogUrl = getOrCreateMeta('property', 'og:url')
    const previousOgUrl = ogUrl.content
    ogUrl.content = canonicalHref

    const twitterTitle = getOrCreateMeta('name', 'twitter:title')
    const previousTwitterTitle = twitterTitle.content
    twitterTitle.content = title

    const twitterDescription = getOrCreateMeta('name', 'twitter:description')
    const previousTwitterDescription = twitterDescription.content
    twitterDescription.content = description

    let restoreImage: (() => void) | null = null
    if (image) {
      const absoluteImage = absoluteUrl(image)
      const ogImage = getOrCreateMeta('property', 'og:image')
      const previousOgImage = ogImage.content
      ogImage.content = absoluteImage
      const twitterImage = getOrCreateMeta('name', 'twitter:image')
      const previousTwitterImage = twitterImage.content
      twitterImage.content = absoluteImage
      restoreImage = () => {
        ogImage.content = previousOgImage
        twitterImage.content = previousTwitterImage
      }
    }

    const jsonLdScripts = (jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []).map((entry) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(entry)
      document.head.append(script)
      return script
    })

    return () => {
      document.title = previousTitle
      descriptionMeta.content = previousDescription
      canonicalLink.remove()
      robotsMeta.remove()
      ogTitle.content = previousOgTitle
      ogDescription.content = previousOgDescription
      ogUrl.content = previousOgUrl
      twitterTitle.content = previousTwitterTitle
      twitterDescription.content = previousTwitterDescription
      restoreImage?.()
      jsonLdScripts.forEach((script) => script.remove())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jsonLd is compared via jsonLdKey
  }, [title, description, path, noindex, image, jsonLdKey])
}
