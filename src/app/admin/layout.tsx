import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <Link href="/admin" className="text-xl font-bold text-pink-500">
            VidPipe <span className="text-white text-sm font-normal">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/admin/add" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            ➕ Add Video
          </Link>
          <Link href="/admin/queue" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            ⏳ Queue Status
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-800">
            <Link href="/" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-pink-400 transition-colors" target="_blank">
              ↗️ View Live Site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
