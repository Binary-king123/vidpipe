/**
 * SEO helpers — used across all pages for consistent meta generation
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun'

/**
 * Strip HTML and truncate to a clean meta description
 */
export function toMetaDescription(text: string, maxLen = 155): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLen)
    .replace(/\s+\S*$/, '') + (text.length > maxLen ? '...' : '')
}

export function videoPageTitle(title: string): string {
  return `${title} | iLoveDesi`
}

export function videoPageDescription(description: string): string {
  return toMetaDescription(description)
}

export function videoCanonicalUrl(slug: string): string {
  return `${APP_URL}/video/${slug}`
}

export function categoryCanonicalUrl(name: string): string {
  return `${APP_URL}/category/${encodeURIComponent(name)}`
}

export function tagCanonicalUrl(name: string): string {
  return `${APP_URL}/tag/${encodeURIComponent(name)}`
}

export { APP_URL }
