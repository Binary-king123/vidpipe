'use client'

import { useState, useRef, useEffect } from 'react'
import { addAndProcessVideo } from '../../admin/actions'

type Phase = 'input' | 'process' | 'done'

export default function BulkDownloaderPage() {
  const [phase, setPhase] = useState<Phase>('input')
  const [urls, setUrls] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('desi')
  const [tags, setTags] = useState('desi, indian')
  const [thumbTime, setThumbTime] = useState('5')
  const [thumbUrl, setThumbUrl] = useState('')
  const [description, setDescription] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let interval: any
    if (loading) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress(p => (p < 95 ? p + 2 : p))
      }, 500)
    } else {
      setProgress(100)
    }
    return () => clearInterval(interval)
  }, [loading])

  function handleStart() {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'))
    if (lines.length > 0) {
      setUrls(lines); setCurrentIdx(0); setPhase('process'); resetForm()
    }
  }

  function resetForm() {
    setTitle(''); setCategory('desi'); setTags('desi, indian')
    setThumbTime('5'); setThumbUrl(''); setDescription('')
    setProgress(0); setCurrentError(null)
  }

  async function handleProcessNext() {
    if (currentIdx >= urls.length) return
    setLoading(true); setCurrentError(null)
    const fd = new FormData()
    fd.append('url', urls[currentIdx]); fd.append('title', title)
    fd.append('category', category); fd.append('tags', tags)
    fd.append('thumbTime', thumbTime); fd.append('thumbUrl', thumbUrl)
    fd.append('description', description)
    try {
      const res = await addAndProcessVideo(fd)
      if (res.success) {
        if (currentIdx + 1 < urls.length) { setCurrentIdx(i => i + 1); resetForm() }
        else setPhase('done')
      } else {
        setCurrentError(res.error || 'Server processing failed.')
      }
    } catch (err: any) {
      setCurrentError(err.message || 'Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Bulk Video Injector</h1>
      <p className="text-gray-400 mb-8">Paste CDN URLs, preview, set metadata, and process them one-by-one.</p>

      {phase === 'input' && (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">Paste Video URLs (One per line)</label>
          <textarea rows={10} value={rawText} onChange={e => setRawText(e.target.value)}
            placeholder={"https://cdn.example.com/video1.mp4\nhttps://cdn.example.com/video2.mp4"}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-pink-500 font-mono text-sm leading-relaxed"
          />
          <button onClick={handleStart} disabled={!rawText.trim()}
            className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
            Start Processing Queue ({rawText.split('\n').filter(l => l.trim().startsWith('http')).length} videos)
          </button>
        </div>
      )}

      {phase === 'process' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-xl">
            <span className="text-pink-400 font-bold">Video {currentIdx + 1} of {urls.length}</span>
            <span className="text-gray-400 text-sm truncate max-w-md ml-4">{urls[currentIdx]}</span>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-5">
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Live Frame Selector</label>
              <video ref={videoRef} src={urls[currentIdx]} controls className="w-full h-auto max-h-64 bg-black rounded" />
            </div>
            {currentError && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">❌ {currentError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Auto-generated if empty" disabled={loading}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} disabled={loading}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Thumb Time (sec)</label>
                <div className="flex gap-2">
                  <input type="number" step="0.1" value={thumbTime} onChange={e => setThumbTime(e.target.value)} disabled={loading}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" />
                  <button type="button" onClick={() => { if (videoRef.current) setThumbTime(videoRef.current.currentTime.toFixed(1)) }}
                    className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-2 rounded-lg text-white">Select Frame</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Custom Thumbnail URL (Overrides Frame)</label>
                <input type="url" value={thumbUrl} onChange={e => setThumbUrl(e.target.value)} placeholder="https://.../cover.jpg" disabled={loading}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} disabled={loading}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" />
            </div>
            <div className="pt-4">
              {loading && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-pink-400 mb-1">
                    <span>Downloading & Processing (FFmpeg)...</span><span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button onClick={handleProcessNext} disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Processing...' : 'Download & Process → Next Video'}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-gray-900 border border-gray-800 p-12 rounded-xl text-center space-y-4">
          <p className="text-6xl">🎉</p>
          <h2 className="text-3xl font-bold text-white">All {urls.length} Videos Processed!</h2>
          <button onClick={() => { setPhase('input'); setUrls([]); setRawText('') }}
            className="mt-6 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-block">
            Start Another Batch
          </button>
        </div>
      )}
    </div>
  )
}
