import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
  const [totalVideos, queueCounts, storageStats] = await Promise.all([
    prisma.video.count(),
    prisma.videoQueue.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    prisma.video.aggregate({
      _sum: {
        originalSizeMb: true,
        compressedSizeMb: true
      }
    }) as any
  ])

  const pending = queueCounts.find((q: { status: string; _count: { id: number } }) => q.status === 'pending')?._count.id || 0
  const processing = queueCounts.find((q: { status: string; _count: { id: number } }) => q.status === 'processing')?._count.id || 0
  const done = queueCounts.find((q: { status: string; _count: { id: number } }) => q.status === 'done')?._count.id || 0
  const failed = queueCounts.find((q: { status: string; _count: { id: number } }) => q.status === 'failed')?._count.id || 0

  const sumOriginal = storageStats?._sum?.originalSizeMb || 0
  const sumCompressed = storageStats?._sum?.compressedSizeMb || 0

  const totalOriginalMb = sumOriginal.toFixed(1)
  const totalCompressedMb = sumCompressed.toFixed(1)
  const savedMb = (sumOriginal - sumCompressed).toFixed(1)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm font-medium mb-1">Total Videos</h2>
          <p className="text-4xl font-bold text-white">{totalVideos}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm font-medium mb-1">Pending in Queue</h2>
          <p className="text-4xl font-bold text-yellow-500">{pending}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm font-medium mb-1">Successfully Processed</h2>
          <p className="text-4xl font-bold text-green-500">{done}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-gray-400 text-sm font-medium mb-1">Failed Downloads</h2>
          <p className="text-4xl font-bold text-red-500">{failed}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Storage Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <h2 className="text-gray-400 text-sm font-medium mb-2">Original Size (Raw CDN)</h2>
          <p className="text-3xl font-bold text-white">{totalOriginalMb} MB</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <h2 className="text-gray-400 text-sm font-medium mb-2">Optimized Size (240p)</h2>
          <p className="text-3xl font-bold text-blue-400">{totalCompressedMb} MB</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl bg-gradient-to-br from-gray-900 to-pink-900/10">
          <h2 className="text-pink-400 text-sm font-medium mb-2">Bandwidth Saved</h2>
          <p className="text-3xl font-bold text-pink-500">{savedMb} MB</p>
          <p className="text-xs text-gray-400 mt-2">Saved per view by compressing locally.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Quick Technical Info</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-sm text-gray-300 space-y-2">
        <p><strong>Database:</strong> Connected via Prisma</p>
        <p><strong>Processing:</strong> FFmpeg (240p compression + thumbnail extraction)</p>
        <p><strong>Storage path:</strong> {process.env.DATA_DIR || '/root/vidpipe/data/videos'}</p>
        <p><strong>Frontend URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun'}</p>
        <p className="mt-4 pt-4 border-t border-gray-800 text-pink-400">
          Tip: You can add videos directly from the "Add Video" tab via URL. The Node.js pipeline handles the rest behind the scenes!
        </p>
      </div>
    </div>
  )
}
