import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun'

export async function GET() {
  const videos = await prisma.video.findMany({
    select: { slug: true, thumbnail: true, title: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const categories = await prisma.video.groupBy({
    by: ['category'],
    where: { category: { not: null } },
  })

  const videoUrls = videos.map((v) => {
    const thumbUrl = v.thumbnail.startsWith('http')
      ? v.thumbnail
      : `${APP_URL}${v.thumbnail}`

    return `
  <url>
    <loc>${APP_URL}/video/${v.slug}</loc>
    <lastmod>${v.createdAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${thumbUrl}</image:loc>
      <image:title>${escapeXml(v.title)}</image:title>
    </image:image>
  </url>`
  }).join('')

  const categoryUrls = categories
    .filter((c) => c.category)
    .map((c) => `
  <url>
    <loc>${APP_URL}/category/${encodeURIComponent(c.category!)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${APP_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${videoUrls}${categoryUrls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
