'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type JobStatus = 'pending' | 'publishing' | 'done' | 'error'

interface Job {
  id: string
  status: JobStatus
  video_url: string
  title: string | null
  description: string | null
  tags: string[] | null
  error_message: string | null
  created_at: string
  scheduled_for: string | null
  platform_video_id: string | null
  video_deleted: boolean
  video_deleted_at: string | null
}

const STATUS_CFG: Record<JobStatus, { label: string; bg: string; text: string; dot: string; progress: number }> = {
  pending:    { label: 'En cola',           bg: 'rgba(148,163,184,0.15)', text: '#94A3B8', dot: '#94A3B8', progress: 10 },
  publishing: { label: 'Publicando en redes', bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', dot: '#3B82F6', progress: 55 },
  done:       { label: 'Publicado con éxito', bg: 'rgba(34,197,94,0.15)', text: '#4ADE80', dot: '#22C55E', progress: 100 },
  error:      { label: 'Error en publicación', bg: 'rgba(239,68,68,0.15)', text: '#F87171', dot: '#EF4444', progress: 100 },
}

const SOCIALS = [
  { key: 'youtube',   label: 'YouTube',   dot: '#EF4444', icon: 'Y' },
  { key: 'instagram', label: 'Instagram', dot: '#EC4899', icon: 'I' },
  { key: 'facebook',  label: 'Facebook',  dot: '#3B82F6', icon: 'F' },
  { key: 'tiktok',    label: 'TikTok',    dot: '#94A3B8', icon: 'T' },
]

export default function JobStatusPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeletingJob, setIsDeletingJob] = useState(false)
  const router = useRouter()

  const handleDeleteJob = async () => {
    if (!job) return
    if (!window.confirm('¿Estás seguro de que quieres eliminar este trabajo? Esta acción no se puede deshacer.')) return
    
    setIsDeletingJob(true)
    try {
      const res = await fetch(`/api/jobs/${id}/delete`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar el trabajo')
      
      alert('Trabajo eliminado correctamente.')
      router.push('/dashboard')
    } catch (err: any) {
      alert(err.message)
      setIsDeletingJob(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    async function fetchJob() {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single()
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setJob(data as Job)
      setLoading(false)
    }

    fetchJob()

    const channel = supabase
      .channel(`job-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${id}` },
        payload => setJob(payload.new as Job))
      .subscribe()

    const interval = setInterval(fetchJob, 3000)
    return () => { supabase.removeChannel(channel); clearInterval(interval) }
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#181E26', minHeight: '60vh' }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 animate-spin" style={{ color: '#1A6B8A' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="font-medium" style={{ color: '#A8B8C8' }}>Cargando publicación…</p>
        </div>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#181E26', minHeight: '60vh' }}>
        <div
          className="text-center p-8 rounded-3xl shadow-md"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: '#181E26', borderColor: '#334155' }}>
            <svg className="w-8 h-8" style={{ color: '#1A6B8A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#F0F4F8' }}>Publicación no encontrada</h2>
          <p className="mb-6 text-sm leading-relaxed" style={{ color: '#A8B8C8' }}>No pudimos encontrar este trabajo.</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg" style={{ backgroundColor: '#1A6B8A' }}>
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  const s = STATUS_CFG[job.status]

  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: '#6A7E94' }}>
          <Link href="/dashboard" className="font-medium transition-colors" style={{ color: '#6A7E94' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F0F4F8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6A7E94'}
          >Dashboard</Link>
          <span className="opacity-50">/</span>
          <span className="font-semibold" style={{ color: '#F0F4F8' }}>Estado de publicación</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Estado ──────────────────────────────────────────── */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl shadow-md" style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}>

              {/* Badge de estado */}
              <div className="flex flex-col gap-2 mb-10">
                <h1 className="text-2xl font-extrabold tracking-tighter" style={{ color: '#F0F4F8' }}>Estado de distribución</h1>
                <p className="text-xs font-mono" style={{ color: '#6A7E94' }}>{job.id}</p>
                <div
                  className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mt-2 border"
                  style={{ backgroundColor: s.bg, color: s.text, borderColor: s.text, backdropFilter: 'blur(8px)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: s.dot,
                      animation: job.status === 'publishing' ? 'pulse 1.5s infinite' : 'none',
                    }}
                  />
                  {job.status === 'pending' && job.scheduled_for ? '📅 Programado' : s.label}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-10">
                <div className="flex justify-between text-sm font-bold mb-3 tracking-tight" style={{ color: '#F0F4F8' }}>
                  <span>Progreso</span>
                  <span style={{ color: '#1A6B8A' }}>{s.progress}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden border" style={{ backgroundColor: '#181E26', borderColor: '#334155' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${s.progress}%`,
                      backgroundColor: job.status === 'error' ? '#EF4444' : job.status === 'done' ? '#22C55E' : '#1A6B8A',
                    }}
                  />
                </div>
                {/* Steps */}
                <div className="flex justify-between mt-4">
                  {[
                    { label: 'Subido', done: true },
                    { label: 'Distribuyendo', done: job.status !== 'pending' },
                    { label: 'Completado', done: job.status === 'done' },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 transition-colors duration-500"
                        style={{
                          backgroundColor: step.done ? '#1A6B8A' : '#181E26',
                          borderColor: step.done ? '#1A6B8A' : '#334155',
                        }}
                      />
                      <span className="text-xs font-semibold" style={{ color: step.done ? '#F0F4F8' : '#6A7E94' }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fecha */}
              <div className="pt-6 border-t" style={{ borderColor: '#334155' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6A7E94' }}>Inicio</p>
                    <p className="font-semibold" style={{ color: '#F0F4F8' }}>
                      {new Date(job.created_at).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'medium' })}
                    </p>
                  </div>
                  {job.scheduled_for && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6A7E94' }}>Programado para</p>
                      <p className="font-semibold" style={{ color: '#EAB308' }}>
                        {new Date(job.scheduled_for).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'medium' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error message */}
              {job.status === 'error' && job.error_message && (
                <div className="mt-6 p-5 rounded-2xl text-sm border shadow-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', color: '#F87171' }}>
                  <p className="font-bold mb-1">Problema durante la distribución</p>
                  <p className="leading-relaxed">{job.error_message}</p>
                </div>
              )}

              {/* Info mensaje */}
              {(job.status === 'pending' || job.status === 'publishing') && (
                <div className="mt-6 p-5 rounded-2xl text-sm leading-relaxed border shadow-sm" style={{ backgroundColor: '#181E26', borderColor: '#334155', color: '#A8B8C8' }}>
                  {job.status === 'pending'
                    ? 'Tu video se ha subido correctamente. Iniciando distribución a las redes conectadas...'
                    : 'Subiendo tu video a YouTube. Esto puede tardar unos segundos dependiendo del tamaño del archivo.'}
                </div>
              )}

              {/* Tags del job */}
              {job.tags && job.tags.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6A7E94' }}>Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: '#334155', color: '#F0F4F8' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Plataformas */}
            {job.status === 'done' && (
              <div className="p-8 rounded-3xl shadow-md" style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}>
                <h3 className="text-lg font-bold mb-5 tracking-tight" style={{ color: '#F0F4F8' }}>Publicado en</h3>
                <div className="flex flex-col gap-3">
                  {/* YouTube — con enlace real si hay platform_video_id */}
                  {job.platform_video_id ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${job.platform_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                      style={{ backgroundColor: '#181E26', border: '1px solid #EF444440' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-md" style={{ backgroundColor: '#EF4444' }}>
                        Y
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: '#F0F4F8' }}>YouTube</p>
                        <p className="text-xs font-mono truncate" style={{ color: '#A8B8C8' }}>youtu.be/{job.platform_video_id}</p>
                      </div>
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl opacity-50"
                      style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ backgroundColor: '#EF4444' }}>Y</div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#F0F4F8' }}>YouTube</p>
                        <p className="text-xs" style={{ color: '#6A7E94' }}>No se publicó en YouTube</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Video Preview ────────────────────────────────────── */}
          <div className="space-y-6">
            {!job.video_deleted && (
              <>
                <h3 className="text-lg font-bold tracking-tight" style={{ color: '#F0F4F8' }}>
                  Video original
                </h3>
                
                <div
                  className="rounded-3xl overflow-hidden shadow-lg border"
                  style={{ border: '1px solid #334155', backgroundColor: '#0B1E33' }}
                >
                  <video
                    src={job.video_url}
                    className="w-full object-contain opacity-80"
                    style={{ maxHeight: '420px' }}
                    controls
                    playsInline
                  />
                </div>
              </>
            )}

            {job.status !== 'publishing' && (
              <button
                onClick={handleDeleteJob}
                disabled={isDeletingJob}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 border flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#F87171', borderColor: '#EF4444' }}
              >
                {isDeletingJob ? 'Eliminando...' : '🗑️ Eliminar trabajo'}
              </button>
            )}

            <div className="flex gap-4 pt-2">
              <Link
                href="/dashboard/upload"
                className="flex-1 text-center py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border"
                style={{ backgroundColor: '#232B36', color: '#1A6B8A', borderColor: '#334155' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#334155' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#232B36' }}
              >
                Subir nuevo video
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 text-center py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: '#1A6B8A', color: 'white', border: '1px solid #1A6B8A' }}
              >
                Ver Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
