'use client'

import Link from 'next/link'

const FOOTER_COLS = [
  {
    title: 'Producto',
    links: [
      { label: 'Características', href: '/#features' },
      { label: 'Precios', href: '/precios' },
      { label: 'Iniciar sesión', href: '/login' },
      { label: 'Crear cuenta gratis', href: '/register' },
    ],
  },
  {
    title: 'Plataformas',
    links: [
      { label: 'YouTube', href: '/#features' },
      { label: 'Instagram', href: '/#features' },
      { label: 'TikTok', href: '/#features' },
      { label: 'Facebook', href: '/#features' },
      { label: 'Pinterest', href: '/#features' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Contacto', href: '/contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: '/legal/terminos' },
      { label: 'Política de privacidad', href: '/legal/privacidad' },
      { label: 'Política de cookies', href: '/legal/cookies' },
    ],
  },
]

export default function Footer() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && window.location.pathname === '/') {
      const id = href.substring(2)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="mt-auto border-t" style={{ backgroundColor: '#111827', borderColor: '#334155' }}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pt-14 pb-8">

        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <img src="/postylogo2.png" alt="Posty" className="h-9 w-auto shrink-0 rounded-xl transition-transform group-hover:scale-105" />
              <span className="text-xl font-extrabold tracking-tight text-[#F0F4F8]">Posty</span>
            </Link>
            <p className="text-xs text-[#6A7E94] leading-relaxed max-w-[200px]">
              Publicá en todas tus redes con un solo clic. La herramienta definitiva para community managers.
            </p>
          </div>

          {/* Nav columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#F0F4F8] mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="text-sm text-[#6A7E94] hover:text-[#F0F4F8] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t" style={{ borderColor: '#334155' }}>
          <p className="text-xs text-[#6A7E94]">
            © {new Date().getFullYear()} Posty SAS. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/legal/privacidad" className="text-xs text-[#6A7E94] hover:text-[#F0F4F8] transition-colors">Privacidad</Link>
            <Link href="/legal/terminos" className="text-xs text-[#6A7E94] hover:text-[#F0F4F8] transition-colors">Términos</Link>
            <Link href="/legal/cookies" className="text-xs text-[#6A7E94] hover:text-[#F0F4F8] transition-colors">Cookies</Link>
            <Link href="/contacto" className="text-xs text-[#6A7E94] hover:text-[#F0F4F8] transition-colors">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
