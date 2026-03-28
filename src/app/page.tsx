import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import VideoCard from '@/components/VideoCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'iLoveDesi — Best Desi Videos Online',
  description: 'Watch the best desi and Indian videos online. Thousands of HD videos by category, tags and more.',
}

const VIDEOS_PER_PAGE = 20

interface HomePageProps {
  searchParams: Promise<{ page?: string; cat?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const cat = params.cat || undefined

  const [videos, total, categories, recentTagsDocs] = await Promise.all([
    prisma.video.findMany({
      where: cat ? { category: cat } : undefined,
      orderBy: { createdAt: 'desc' },
      take: VIDEOS_PER_PAGE,
      skip: (page - 1) * VIDEOS_PER_PAGE,
      select: {
        id: true, title: true, slug: true, thumbnail: true, views: true, category: true, tags: true
      },
    }),
    prisma.video.count({ where: cat ? { category: cat } : undefined }),
    prisma.video.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 12,
    }),
    prisma.video.findMany({
      select: { tags: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const tagCounts = recentTagsDocs.flatMap(v => v.tags).reduce((acc, tag) => {
    if (tag) acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(t => t[0])

  const totalPages = Math.ceil(total / VIDEOS_PER_PAGE)

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {cat ? `${cat} Videos` : 'Best Desi Videos Online'}
        </h1>
        <p className="text-gray-400 text-sm">
          {total.toLocaleString()} videos • Page {page} of {totalPages || 1}
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!cat ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          All
        </Link>
        {categories.filter(c => c.category).map((c) => (
          <Link
            key={c.category}
            href={`/?cat=${encodeURIComponent(c.category!)}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c.category ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {c.category} ({c._count.id})
          </Link>
        ))}
      </div>

      {/* SEO Tag Cloud */}
      <div className="mb-8">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">Popular SEO Tags</h3>
        <div className="flex flex-wrap gap-2">
          {topTags.map(tag => (
            <Link 
              key={tag} 
              href={`/tag/${encodeURIComponent(tag)}`}
              className="text-xs text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 rounded-md transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-24 text-gray-600">
          <p className="text-5xl mb-4">📹</p>
          <p className="text-lg">No videos yet. Run the pipeline to add videos.</p>
          <code className="text-sm text-pink-500 mt-2 block">node pipeline/downloader.js</code>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              title={video.title}
              slug={video.slug}
              thumbnail={video.thumbnail}
              views={video.views}
              category={video.category}
              tags={video.tags}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/?page=${page - 1}${cat ? `&cat=${cat}` : ''}`}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm transition-colors"
            >
              ← Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/?page=${page + 1}${cat ? `&cat=${cat}` : ''}`}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
