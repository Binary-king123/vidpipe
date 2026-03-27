import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { videoPageTitle, videoPageDescription, videoCanonicalUrl, APP_URL } from '@/lib/seo'
import VideoPlayer from '@/components/VideoPlayer'
import RelatedVideos from '@/components/RelatedVideos'

// Memoize so generateMetadata and Page share one DB call
const getVideo = cache(async (slug: string) => {
  return prisma.video.findUnique({
    where: { slug },
  })
})

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const video = await getVideo(slug)
  if (!video) return { title: 'Not Found' }

  return {
    title: videoPageTitle(video.title),
    description: videoPageDescription(video.description),
    keywords: video.tags,
    alternates: { canonical: videoCanonicalUrl(slug) },
    openGraph: {
      title: video.title,
      description: videoPageDescription(video.description),
      url: videoCanonicalUrl(slug),
      type: 'video.other',
      images: [
        {
          url: video.thumbnail.startsWith('http')
            ? video.thumbnail
            : `${APP_URL}${video.thumbnail}`,
          width: 426,
          height: 240,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: videoPageDescription(video.description),
    },
  }
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params
  const video = await getVideo(slug)
  if (!video) notFound()

  // Increment view count (fire-and-forget)
  prisma.video.update({
    where: { id: video.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  // Related: same category OR shared tags (up to 20)
  const related = await prisma.video.findMany({
    where: {
      slug: { not: slug },
      OR: [
        { category: video.category ?? undefined },
        { tags: { hasSome: video.tags.slice(0, 3) } },
      ],
    },
    orderBy: { views: 'desc' },
    take: 20,
    select: { id: true, title: true, slug: true, thumbnail: true, views: true, category: true, tags: true },
  })

  const videoSrc = video.filePath.startsWith('http')
    ? video.filePath
    : video.filePath

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Player */}
        <VideoPlayer
          src={videoSrc}
          poster={video.thumbnail}
          title={video.title}
        />

        {/* Title + meta */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white leading-snug">{video.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span>{video.views.toLocaleString()} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {video.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Category link */}
        {video.category && (
          <div className="mt-3">
            <Link
              href={`/category/${encodeURIComponent(video.category)}`}
              className="inline-flex items-center gap-1 text-pink-400 text-sm hover:text-pink-300 transition-colors"
            >
              📂 {video.category}
            </Link>
          </div>
        )}

        {/* SEO Description (300-500 words — critical for Google indexing) */}
        <div className="mt-6 border-t border-gray-800 pt-6">
          <h2 className="text-base font-semibold text-gray-300 mb-3">About this video</h2>
          <div className="text-sm text-gray-400 leading-7 whitespace-pre-line">
            {video.description}
          </div>
        </div>

        {/* Internal links section */}
        <div className="mt-8 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Browse More</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="text-xs text-pink-400 hover:underline">🏠 Home</Link>
            {video.category && (
              <Link href={`/category/${encodeURIComponent(video.category)}`} className="text-xs text-pink-400 hover:underline">
                📂 {video.category}
              </Link>
            )}
            {video.tags.slice(0, 5).map(tag => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="text-xs text-gray-400 hover:text-pink-400 transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Related Videos */}
      <div className="lg:w-80 xl:w-96 flex-shrink-0">
        <RelatedVideos videos={related} currentSlug={slug} />
      </div>
    </div>
  )
}
