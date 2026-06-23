import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { headers } from 'next/headers'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Leer la ruta actual para adaptar el diseño
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || ''
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Posty</span>
            </Link>

            {/* Navegación principal */}
            <nav className="hidden md:flex gap-6">
              {user && isDashboard ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/upload" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    Subir video
                  </Link>
                  <Link href="/dashboard/connect" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    Conectar redes
                  </Link>
                </>
              ) : !user ? (
                <>
                  <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    Características
                  </Link>
                  <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    Precios
                  </Link>
                </>
              ) : (
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  Ir al Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Menú de usuario / Auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-900">{user.email}</span>
                  <span className="text-xs text-slate-500">Plan Pro</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-2"
                    title="Cerrar sesión"
                  >
                    Salir
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-3 py-2"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
                >
                  Comenzar gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
