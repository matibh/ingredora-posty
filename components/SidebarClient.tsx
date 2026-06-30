'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
}

const PUBLIC_NAV: NavItem[] = [
  { 
    label: 'Características', 
    href: '/#features',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  },
  { 
    label: 'Planes y precios',
    href: '/pricing',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  { 
    label: 'Contacto', 
    href: '/contacto',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
  },
]

const DASHBOARD_SECTIONS: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { 
        label: 'Dashboard', 
        href: '/dashboard',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      },
      { 
        label: 'Publicar video', 
        href: '/dashboard/upload',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
      },
    ],
  },
  {
    label: 'Clientes',
    items: [
      { 
        label: 'Mis Clientes', 
        href: '/dashboard/accounts',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      },
    ],
  },
  {
    label: 'Historial',
    items: [
      { 
        label: 'Publicaciones', 
        href: '/dashboard/jobs',
        icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      },
    ],
  },
  {
    label: 'Planes',
    items: [
      { label: 'Planes y precios', href: '/precios', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ],
  },
]

interface SidebarClientProps {
  user: { email?: string } | null
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('posty_sidebar_collapsed')
    if (stored === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  // Public paths where Sidebar should be hidden (we show TopNavbar instead)
  const isPublicPath = 
    pathname === '/' || 
    pathname === '/pricing' || 
    pathname === '/precios' || 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/contacto' || 
    pathname?.startsWith('/legal')

  if (isPublicPath) {
    return null;
  }

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('posty_sidebar_collapsed', String(newState))
  }

  const navContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header / Logo */}
      <div className={`flex items-center h-16 border-b shrink-0 px-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`} style={{ borderColor: '#334155' }}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setIsOpen(false)}>
          <img src="/postylogo2.png" alt="Posty" className="h-9 w-auto shrink-0 rounded-xl transition-transform group-hover:scale-105" />
          {!isCollapsed && <span className="text-xl font-extrabold tracking-tight text-[#F0F4F8]">Posty</span>}
        </Link>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6">
        {user ? (
          DASHBOARD_SECTIONS.map(section => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#6A7E94] mb-2">{section.label}</p>
              )}
              <div className="flex flex-col gap-1">
                {section.items.map(item => (
                  <SidebarLink key={item.href} item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} onClick={() => setIsOpen(false)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#6A7E94] mb-2">Menú</p>
            )}
            <div className="flex flex-col gap-1">
              {PUBLIC_NAV.map(item => (
                <SidebarLink key={item.href} item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} onClick={() => setIsOpen(false)} />
              ))}
            </div>
          </div>
        )}

        {/* Legal Nav Links */}
        <div className="mt-auto pt-4">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#6A7E94] mb-2">Legal</p>
          )}
          <div className="flex flex-col gap-1">
            <SidebarLink item={{ label: 'Términos', href: '/legal/terminos', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }} isActive={pathname === '/legal/terminos'} isCollapsed={isCollapsed} onClick={() => setIsOpen(false)} />
            <SidebarLink item={{ label: 'Privacidad', href: '/legal/privacidad', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> }} isActive={pathname === '/legal/privacidad'} isCollapsed={isCollapsed} onClick={() => setIsOpen(false)} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t flex flex-col gap-2 shrink-0" style={{ borderColor: '#334155' }}>
        {user ? (
          <>
            <div className={`flex items-center gap-3 p-2 rounded-xl mb-2 ${isCollapsed ? 'justify-center' : ''}`} style={{ backgroundColor: '#232B36' }}>
              <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#1A6B8A' }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#F0F4F8] truncate">{user.email?.split('@')[0]}</p>
                </div>
              )}
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#F87171] hover:bg-red-500/10 transition-colors ${isCollapsed ? 'px-0' : 'px-4'}`} title="Cerrar sesión">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!isCollapsed && <span>Cerrar sesión</span>}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" onClick={() => setIsOpen(false)} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[#A8B8C8] hover:text-[#F0F4F8] hover:bg-[#232B36] transition-colors`} title="Iniciar sesión">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              {!isCollapsed && <span>Iniciar sesión</span>}
            </Link>
            {!isCollapsed && (
              <Link href="/register" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#1A6B8A' }}>
                Comenzar gratis
              </Link>
            )}
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className={`hidden md:flex items-center justify-center p-2 mt-2 rounded-xl text-[#6A7E94] hover:text-[#F0F4F8] hover:bg-[#232B36] transition-colors ${isCollapsed ? '' : 'self-end'}`}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* MOBILE TOP HEADER */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b shrink-0 bg-[#181E26] sticky top-0 z-40" style={{ borderColor: '#334155' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/postylogo2.png" alt="Posty" className="h-8 w-auto shrink-0 rounded-lg" />
          <span className="text-lg font-extrabold tracking-tight text-[#F0F4F8]">Posty</span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 rounded-lg text-[#6A7E94] hover:text-[#F0F4F8] hover:bg-[#232B36] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MOBILE DRAWER SIDEBAR */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out bg-[#181E26] border-r ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderColor: '#334155' }}
      >
        {navContent}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col h-full bg-[#181E26] border-r transition-all duration-300 ease-in-out shrink-0 sticky top-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
        style={{ borderColor: '#334155' }}
      >
        {navContent}
      </aside>
    </>
  )
}

function SidebarLink({ item, isActive, isCollapsed, onClick }: { item: NavItem, isActive: boolean, isCollapsed: boolean, onClick: () => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick()
    if (item.href.startsWith('/#') && window.location.pathname === '/') {
      const id = item.href.substring(2)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      title={isCollapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive
          ? 'text-[#F0F4F8] bg-[#1A6B8A]/20'
          : 'text-[#A8B8C8] hover:text-[#F0F4F8] hover:bg-[#232B36]'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <div className={`${isActive ? 'text-[#1A6B8A]' : 'text-[#6A7E94] group-hover:text-[#F0F4F8]'} shrink-0 transition-colors`}>
        {item.icon}
      </div>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}
