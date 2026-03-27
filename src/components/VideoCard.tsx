'use client'

import Link from 'next/link'
import Image from 'next/image'

interface VideoCardProps {
  title: string
  slug: string
  thumbnail: string
  views: number
  category?: string | null
  tags?: string[]
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function VideoCard({ title, slug, thumbnail, views, category, tags }: VideoCardProps) {
  const thumbSrc = thumbnail.startsWith('http') ? thumbnail : thumbnail

  return (
    <Link href={`/video/${slug}`} className="group block rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-pink-500 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/10">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        <img
          src={thumbSrc}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.jpg'
          }}
        />
        {/* Views badge */}
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatViews(views)} views
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
          {title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {category && (
            <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
          {tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-gray-500">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
