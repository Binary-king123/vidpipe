import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun'
const URLS_PER_SHARD = 1000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ]

  // All videos
  const videos = await prisma.video.findMany({
    select: { slug: true, thumbnail: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const videoEntries: MetadataRoute.Sitemap = videos.map((v: { slug: string; thumbnail: string; createdAt: Date }) => ({
    url: `${APP_URL}/video/${v.slug}`,
    lastModified: v.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    images: [
      v.thumbnail.startsWith('http') ? v.thumbnail : `${APP_URL}${v.thumbnail}`,
    ],
  }))

  // Category pages
  const categories = await prisma.video.groupBy({
    by: ['category'],
    where: { category: { not: null } },
  })
  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c: { category: string | null }) => c.category)
    .map((c: { category: string | null }) => ({
      url: `${APP_URL}/category/${encodeURIComponent(c.category!)}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...videoEntries, ...categoryEntries]
}
