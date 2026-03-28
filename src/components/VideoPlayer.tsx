'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title: string
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0)
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column' }}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          preload="metadata"
          playsInline
          aria-label={title}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            backgroundColor: '#000',
          }}
        />
        <div style={{
          height: '2px',
          background: `linear-gradient(to right, #db2777 ${progress}%, transparent 0%)`,
        }} />
      </div>
    </div>
  )
}
