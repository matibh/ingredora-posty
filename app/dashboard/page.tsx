import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile data (streak_day). Gracefully handle if table doesn't exist yet.
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_day')
    .eq('id', user.id)
    .single()

  const streakDay = profile?.streak_day ?? 0

  return (
    <div className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Bienvenido, <span className="text-blue-600">{user.email?.split('@')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">Aquí tienes un resumen de tu actividad.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Streak card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Racha actual</p>
                <p className="text-4xl font-extrabold text-slate-900 mt-2">
                  {streakDay}
                  <span className="text-2xl ml-1">🔥</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">Días consecutivos publicando</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Account card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Cuenta vinculada</p>
                <p className="text-lg font-bold text-slate-900 mt-2 truncate max-w-[180px]">
                  {user.email}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Sesión activa
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Connect Social card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-600 text-sm font-medium">Redes sociales</p>
                <p className="text-slate-900 font-bold mt-2">Sin conectar</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-blue-100 shadow-sm">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <Link
              id="connect-social-link"
              href="/dashboard/connect"
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 bg-white text-sm text-blue-700 hover:text-blue-800 font-semibold transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Conectar redes sociales
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick actions & Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold text-slate-900">Trabajos recientes</h2>
               <Link href="/dashboard/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                 Ver todos
               </Link>
             </div>
             
             {/* Placeholder for recent jobs */}
             <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-200">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-slate-900">No hay trabajos recientes</h3>
                <p className="text-sm text-slate-500 mt-1">Sube un video para empezar a publicar</p>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Acciones rápidas</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/upload"
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">Nueva publicación</p>
                  <p className="text-slate-500 text-xs">Sube y renderiza ahora</p>
                </div>
              </Link>

              <Link
                href="/dashboard/schedule"
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group opacity-50 cursor-not-allowed"
                title="Próximamente"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">Programar post</p>
                  <p className="text-slate-500 text-xs">Elige fecha y hora (Pronto)</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
