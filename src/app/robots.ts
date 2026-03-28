import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/add', '/admin/queue'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
