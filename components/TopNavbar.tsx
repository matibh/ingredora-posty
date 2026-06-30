"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function TopNavbar({ user }: { user: { email?: string } | null }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full relative z-50 border-b" style={{ backgroundColor: '#181E26', borderColor: '#334155' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img src="/postylogo2.png" alt="Posty" className="h-8 w-auto rounded-lg" />
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-gray-200 transition-colors">
                Posty
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: '#A8B8C8' }}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/#features" className="hover:text-white transition-colors">Características</Link>
              <Link href="/precios" className="hover:text-white transition-colors">Planes y Precios</Link>
              <Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>

          {/* Desktop Right Button */}
          <div className="hidden md:flex items-center">
            {user ? (
              <Link href="/dashboard" className="px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg" style={{ backgroundColor: '#7AD0E8', color: '#0B1E33' }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg" style={{ backgroundColor: '#1A6B8A', color: '#FFFFFF' }}>
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t absolute w-full left-0" style={{ borderColor: '#334155', backgroundColor: '#181E26' }}>
          <div className="px-4 pt-2 pb-4 space-y-2 text-sm font-medium text-gray-300">
            <Link href="/" className="block py-2 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/#features" className="block py-2 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>Características</Link>
            <Link href="/precios" className="block py-2 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>Planes y Precios</Link>
            <Link href="/contacto" className="block py-2 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>Contacto</Link>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#334155' }}>
              {user ? (
                <Link href="/dashboard" className="block w-full text-center px-5 py-3 rounded-xl font-bold transition-colors" style={{ backgroundColor: '#7AD0E8', color: '#0B1E33' }} onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="block w-full text-center px-5 py-3 rounded-xl font-bold transition-colors" style={{ backgroundColor: '#1A6B8A', color: '#FFFFFF' }} onClick={() => setIsOpen(false)}>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
