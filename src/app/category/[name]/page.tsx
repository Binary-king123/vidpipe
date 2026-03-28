import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import VideoCard from '@/components/VideoCard'
import Link from 'next/link'

interface Props {
  params: Promise<{ name: string }>
  searchParams: Promise<{ page?: string }>
}

const PER_PAGE = 20

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const category = decodeURIComponent(name)
  return {
    title: `${category} Videos`,
    description: `Watch the best ${category} videos online. Browse our hand-picked collection of ${category} content, updated daily.`,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/category/${name}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { name } = await params
  const sp = await searchParams
  const category = decodeURIComponent(name)
  const page = Math.max(1, parseInt(sp.page || '1', 10))

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      select: { id: true, title: true, slug: true, thumbnail: true, views: true, category: true, tags: true },
    }),
    prisma.video.count({ where: { category } }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2 capitalize">{category} Videos</h1>
      <p className="text-gray-400 text-sm mb-6">{total.toLocaleString()} videos</p>

      {videos.length === 0 ? (
        <div className="text-center py-24 text-gray-600">
          <p>No videos in this category yet.</p>
          <Link href="/" className="text-pink-500 mt-2 inline-block">← Back to Home</Link>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard key={v.id} title={v.title} slug={v.slug} thumbnail={v.thumbnail} views={v.views} category={v.category} tags={v.tags} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && <Link href={`/category/${name}?page=${page - 1}`} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm">← Previous</Link>}
          <span className="px-4 py-2 text-sm text-gray-400">{page} / {totalPages}</span>
          {page < totalPages && <Link href={`/category/${name}?page=${page + 1}`} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm">Next →</Link>}
        </div>
      )}
    </div>
  )
}
