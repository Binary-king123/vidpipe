import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'iLoveDesi — Best Desi Videos Online',
    template: '%s | iLoveDesi',
  },
  description: 'Watch the best desi and Indian videos online. Browse thousands of HD videos by category and tag.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun'),
  openGraph: {
    siteName: 'iLoveDesi',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans">
        {/* Navigation */}
        <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold text-pink-500 hover:text-pink-400 transition-colors tracking-tight">
              iLoveDesi
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/category/desi" className="hover:text-white transition-colors">Desi</Link>
              <Link href="/category/indian" className="hover:text-white transition-colors">Indian</Link>
              <Link href="/tag/hot" className="hover:text-white transition-colors">Hot</Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-12 py-8 text-center text-sm text-gray-600">
          <div className="max-w-7xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} iLoveDesi. All rights reserved.</p>
            <p className="mt-1">
              <Link href="/sitemap.xml" className="hover:text-gray-400">Sitemap</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
