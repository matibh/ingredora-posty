import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DashboardClientGrid from '@/components/DashboardClientGrid'

const STATUS_BADGE: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  done:       { label: 'Publicado',   bg: 'rgba(34,197,94,0.15)', dot: '#22C55E', text: '#4ADE80' },
  publishing: { label: 'Publicando…', bg: 'rgba(59,130,246,0.15)', dot: '#3B82F6', text: '#60A5FA' },
  pending:    { label: 'En cola',     bg: 'rgba(148,163,184,0.15)', dot: '#94A3B8', text: '#94A3B8' },
  error:      { label: 'Error',       bg: 'rgba(239,68,68,0.15)', dot: '#EF4444', text: '#F87171' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Streak
  const { data: profile } = await supabase
    .from('profiles').select('streak_day').eq('id', user.id).single()
  const streakDay = profile?.streak_day ?? 0

  // Últimos 10 jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Bienvenida ─────────────────────────────────────────── */}
        <div
          className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-3xl shadow-md"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#6A7E94' }}>Bienvenido de vuelta</p>
            <h1 className="text-3xl font-extrabold tracking-tighter" style={{ color: '#F0F4F8' }}>
              👋 Hola, <span style={{ color: '#1A6B8A' }}>{user.email?.split('@')[0]}</span>
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#A8B8C8' }}>{user.email}</p>
          </div>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
            style={{ backgroundColor: '#1A6B8A' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Publicar ahora
          </Link>
        </div>

        {/* ── Clientes (Vista Principal) ─────────────────────────── */}
        <DashboardClientGrid />

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard icon="🔥" label="Racha actual" value={`${streakDay} días`} sub="Consecutivos publicando" />
          <StatCard icon="📤" label="Publicaciones totales" value={recentJobs?.filter(j => j.status === 'done').length ?? 0} sub="Videos distribuidos con éxito" />
          <StatCard
            icon="🔗"
            label="Redes conectadas"
            value="—"
            sub={
              <Link href="/dashboard/accounts" className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80" style={{ color: '#1A6B8A' }}>
                Gestionar conexiones →
              </Link>
            }
          />
        </div>

        {/* ── Últimas publicaciones ───────────────────────────────── */}
        <div
          className="rounded-3xl shadow-md overflow-hidden"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: '#334155' }}>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: '#F0F4F8' }}>Últimas publicaciones</h2>
          </div>

          {!recentJobs || recentJobs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: '#181E26', borderColor: '#334155' }}>
                <svg className="w-8 h-8" style={{ color: '#1A6B8A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1 tracking-tight" style={{ color: '#F0F4F8' }}>Aún no hay publicaciones</h3>
              <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: '#A8B8C8' }}>
                Cuando subas y publiques un video, aparecerá aquí con su estado.
              </p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentJobs.map((job) => {
                const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE.pending
                return (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ border: '1px solid #334155', backgroundColor: '#181E26' }}
                  >
                    <div className="relative aspect-video overflow-hidden border-b" style={{ backgroundColor: '#181E26', borderColor: '#334155' }}>
                      {job.video_url ? (
                        <video src={job.video_url} className="w-full h-full object-cover opacity-80" muted playsInline />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-10 h-10" style={{ color: '#334155' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-md"
                        style={{ backgroundColor: badge.bg, color: badge.text, backdropFilter: 'blur(4px)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.dot, animation: job.status === 'publishing' ? 'pulse 2s infinite' : 'none' }} />
                        {badge.label}
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate tracking-tight" style={{ color: '#F0F4F8' }}>Video publicado</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#6A7E94' }}>{job.id.toString().slice(0, 8)}</p>
                      </div>
                      <p className="text-xs whitespace-nowrap flex-shrink-0 font-medium" style={{ color: '#A8B8C8' }}>
                        {new Date(job.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}>{icon}</div>
      <p className="text-sm font-medium mb-1" style={{ color: '#6A7E94' }}>{label}</p>
      <p className="text-2xl font-extrabold tracking-tighter" style={{ color: '#F0F4F8' }}>{value}</p>
      <p className="text-xs mt-1 leading-relaxed" style={{ color: '#A8B8C8' }}>{sub}</p>
    </div>
  )
}
