import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-8xl mb-4">🎬</p>
      <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6">This video or page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
