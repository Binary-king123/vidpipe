'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title: string
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [])

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        preload="metadata"
        playsInline
        aria-label={title}
        className="w-full max-h-[70vh] object-contain"
        style={{ display: 'block' }}
      />
      {/* Progress bar overlay (subtle) */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-pink-500 transition-all duration-300"
        style={{ width: `${progress}%` }} />
    </div>
  )
}
