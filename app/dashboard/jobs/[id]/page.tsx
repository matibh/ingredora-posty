'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type JobStatus = 'pending' | 'processing' | 'done' | 'error'

interface Job {
  id: string
  status: JobStatus
  template: string
  overlay_text: string
  input_video_path: string
  output_video_url: string | null
  error_message: string | null
  created_at: string
}

const STATUS_CONFIG: Record<JobStatus, {
  label: string
  color: string
  bg: string
  icon: React.ReactNode
  progress: number
}> = {
  pending: {
    label: 'En cola',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    progress: 15,
    icon: (
      <svg className="w-5 h-5 animate-pulse text-amber-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  processing: {
    label: 'Renderizando',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    progress: 60,
    icon: (
      <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    ),
  },
  done: {
    label: 'Completado',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    progress: 100,
    icon: (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    label: 'Error',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    progress: 100,
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
}

const TEMPLATE_NAMES: Record<string, string> = {
  classic: 'Clásico Profesional',
  modern: 'Impacto Moderno',
  cooling_break: 'Cooling Break',
}

export default function JobStatusPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchJob() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setJob(data as Job)
      setLoading(false)
    }

    // Initial fetch
    fetchJob()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`job-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setJob(payload.new as Job)
        }
      )
      .subscribe()

    // Polling fallback every 5s for environments without realtime
    const interval = setInterval(fetchJob, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-slate-600 font-medium">Cargando estado del trabajo...</p>
        </div>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Trabajo no encontrado</h2>
          <p className="text-slate-500 mb-6">No pudimos encontrar el trabajo que estás buscando.</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors">
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[job.status]

  return (
    <div className="flex-1 bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-slate-900">Estado del trabajo</span>
        </nav>

        {/* Status card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detalles de renderizado</h1>
              <p className="text-slate-500 text-sm mt-1 font-mono break-all">{job.id}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold shadow-sm ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.icon}
              {statusCfg.label}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-3">
              <span>Progreso general</span>
              <span>{statusCfg.progress}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  job.status === 'error'
                    ? 'bg-red-500'
                    : job.status === 'done'
                    ? 'bg-green-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${statusCfg.progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between mt-4">
              {[
                { label: 'En cola', done: true },
                { label: 'Procesando', done: job.status !== 'pending' },
                { label: 'Completado', done: job.status === 'done' },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full shadow-sm border-2 ${step.done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`} />
                  <span className={`text-xs font-medium ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <h3 className="text-lg font-bold text-slate-900 mb-4">Configuración</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Template elegido</p>
              <p className="text-slate-900 font-medium">{TEMPLATE_NAMES[job.template] ?? job.template}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Fecha de creación</p>
              <p className="text-slate-900 font-medium">
                {new Date(job.created_at).toLocaleString('es-AR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 sm:col-span-2">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Texto del overlay</p>
              <p className="text-slate-900 font-medium">{job.overlay_text}</p>
            </div>
          </div>

          {/* Error message */}
          {job.status === 'error' && job.error_message && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-8 shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold mb-1">El renderizado ha fallado</p>
                <p>{job.error_message}</p>
              </div>
            </div>
          )}

          {/* Output video */}
          {job.status === 'done' && job.output_video_url && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-slate-900">Resultado</h3>
              <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
                <video
                  src={job.output_video_url}
                  className="w-full aspect-video object-contain"
                  controls
                  playsInline
                />
              </div>
              <div className="flex justify-end">
                <a
                  href={job.output_video_url}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
                    bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar video final
                </a>
              </div>
            </div>
          )}

          {/* Pending/Processing message */}
          {(job.status === 'pending' || job.status === 'processing') && (
            <div className="text-center py-6 bg-blue-50 border border-blue-100 rounded-xl mt-4">
              <p className="text-blue-800 font-medium">
                {job.status === 'pending'
                  ? 'Tu video está en cola. El proceso de renderizado comenzará automáticamente.'
                  : 'Nuestros servidores están aplicando tu template. Esto puede tomar unos minutos.'}
              </p>
              <p className="text-blue-600/70 text-sm mt-1">
                Puedes dejar esta página abierta o volver más tarde; el proceso continuará en segundo plano.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            href="/dashboard/upload"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear otro video
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
