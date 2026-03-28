'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AgeGate() {
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    // Check if the user has already confirmed they are 18+
    const hasConfirmed = localStorage.getItem('age_verified_18plus')
    if (!hasConfirmed) {
      setShowGate(true)
      // Prevent scrolling while gate is open
      document.body.style.overflow = 'hidden'
    }
  }, [])

  const handleEnter = () => {
    localStorage.setItem('age_verified_18plus', 'true')
    setShowGate(false)
    document.body.style.overflow = 'auto'
  }

  const handleExit = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!showGate) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
        <h2 className="text-3xl font-bold text-pink-500 mb-4">Warning: Adult Content</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          This website contains age-restricted adult material. You must be 18 years of age or older to enter. 
          By entering, you confirm that you are of legal age in your jurisdiction and that you consent to viewing sexually explicit content.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={handleExit}
            className="flex-1 px-6 py-3 rounded-lg font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition"
          >
            I am under 18 - EXIT
          </button>
          <button
            onClick={handleEnter}
            className="flex-1 px-6 py-3 rounded-lg font-bold text-white bg-pink-600 hover:bg-pink-500 transition shadow-[0_0_15px_rgba(236,72,153,0.5)]"
          >
            I am 18+ - ENTER
          </button>
        </div>
        
        <p className="mt-8 text-xs text-gray-500">
          By clicking enter, you agree to our <Link href="/terms" className="text-pink-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
