'use client'

import Link from 'next/link'
import VideoCard from './VideoCard'

interface Video {
  id: number
  title: string
  slug: string
  thumbnail: string
  views: number
  category?: string | null
  tags?: string[]
}

interface RelatedVideosProps {
  videos: Video[]
  currentSlug: string
}

export default function RelatedVideos({ videos, currentSlug }: RelatedVideosProps) {
  const related = videos.filter(v => v.slug !== currentSlug).slice(0, 20)

  if (related.length === 0) return null

  return (
    <aside className="space-y-3">
      <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
        Related Videos
      </h2>
      <div className="space-y-3">
        {related.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.slug}`}
            className="flex gap-3 group hover:bg-gray-800/60 rounded-lg p-1.5 transition-colors"
          >
            <div className="relative flex-shrink-0 w-32 aspect-video rounded overflow-hidden bg-gray-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-white line-clamp-2 group-hover:text-pink-400 transition-colors font-medium">
                {video.title}
              </h3>
              {video.category && (
                <p className="text-xs text-gray-500 mt-1">{video.category}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
