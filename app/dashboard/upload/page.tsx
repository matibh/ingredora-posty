'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Template definitions ────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Clásico Profesional',
    description: 'Overlay centrado con tipografía limpia y borde sutil, ideal para contenido corporativo o educativo.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-4.5A1.125 1.125 0 013.375 12h.75m15 7.5v-4.5A1.125 1.125 0 0018 13.875m1.5 5.625a1.125 1.125 0 01-1.125 1.125M18 13.875v-1.5a1.125 1.125 0 00-1.125-1.125H7.125A1.125 1.125 0 006 12.375v1.5m12 0v4.5" />
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'modern',
    name: 'Impacto Moderno',
    description: 'Degradado vibrante con texto en esquina y animación de entrada. Perfecto para Instagram y TikTok.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    id: 'cooling_break',
    name: 'Cooling Break',
    description: 'Estilo frío y minimalista con overlay traslúcido en la parte inferior. Da un respiro visual a tu audiencia.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    color: 'cyan',
  },
] as const

type TemplateId = (typeof TEMPLATES)[number]['id']

export default function UploadPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern')
  const [overlayText, setOverlayText] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setVideoFile(file)
    setError(null)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500 MB
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleSubmit() {
    if (!videoFile) return setError('Por favor selecciona un video.')
    if (!overlayText.trim()) return setError('Por favor escribe el texto del overlay.')

    setIsUploading(true)
    setError(null)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('template', selectedTemplate)
      formData.append('overlayText', overlayText.trim())

      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 5, 85))
      }, 400)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(95)

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Error al subir el video')
      }

      setUploadProgress(100)
      setTimeout(() => router.push(`/dashboard/jobs/${json.job?.id || json.job_id}`), 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const template = TEMPLATES.find((t) => t.id === selectedTemplate)!

  return (
    <div className="flex-1 bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-slate-900">Nueva publicación</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Sube un video</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Sube tu contenido original, aplica un template y prepáralo para publicar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: upload + preview ── */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">1. Archivo de video</h2>
              
              {/* Dropzone */}
              <div
                {...getRootProps()}
                id="video-dropzone"
                className={`
                  relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
                  ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : videoFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100'
                  }
                `}
              >
                <input {...getInputProps()} id="video-input" />

                {videoFile && videoPreview ? (
                  <div className="relative group">
                    <video
                      src={videoPreview}
                      className="w-full aspect-video object-cover"
                      muted
                      playsInline
                      controls
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm">
                      <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {videoFile.name}
                    </div>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center gap-3 px-6 text-center">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                      ${isDragActive ? 'bg-blue-100 scale-110' : 'bg-white border border-slate-200'}
                    `}>
                      <svg className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    {isDragActive ? (
                      <p className="text-blue-600 font-semibold text-lg">¡Suelta el video aquí!</p>
                    ) : (
                      <>
                        <p className="text-slate-700 font-semibold text-lg">Arrastra tu video aquí</p>
                        <p className="text-slate-500 text-sm">o haz click para seleccionar desde tu computadora</p>
                        <p className="text-slate-400 text-xs mt-2 font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                          MP4, MOV, AVI, WebM · máx 500 MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {fileRejections.length > 0 && (
                <p className="text-red-500 text-sm mt-3 font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {fileRejections[0].errors[0].message}
                </p>
              )}

              {/* File info footer */}
              {videoFile && (
                <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-slate-700 truncate font-medium">
                    <span className="truncate max-w-[200px]">{videoFile.name}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-slate-500 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">{formatFileSize(videoFile.size)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null) }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Eliminar archivo"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: config ── */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">2. Configuración visual</h2>
              
              {/* Template selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Elige un template
                </label>
                <div className="space-y-3">
                  {TEMPLATES.map((t) => {
                    const isSelected = selectedTemplate === t.id;
                    return (
                      <button
                        key={t.id}
                        id={`template-${t.id}`}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`
                          w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                          ${isSelected 
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm
                          ${t.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                          ${t.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
                          ${t.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' : ''}
                        `}>
                          {t.icon}
                        </div>

                        <div className="flex-1 min-w-0 mt-0.5">
                          <p className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {t.name}
                          </p>
                          <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                            {t.description}
                          </p>
                        </div>

                        <div className={`
                          mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300'
                          }
                        `}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overlay text */}
              <div>
                <label htmlFor="overlay-text" className="block text-sm font-semibold text-slate-700 mb-2">
                  Texto principal del video
                </label>
                <div className="relative">
                  <textarea
                    id="overlay-text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Ej: ¡Nueva colección disponible! 🔥 Compra ahora en el link de la bio."
                    maxLength={120}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm placeholder-slate-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      transition-colors resize-none text-sm text-slate-900"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className={`text-xs font-medium ${overlayText.length >= 110 ? 'text-orange-500' : 'text-slate-400'}`}>
                      {overlayText.length}/120
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Este texto se superpondrá usando el estilo del template elegido.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="font-medium">{error}</div>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {uploadProgress < 50 ? 'Subiendo archivo...' :
                     uploadProgress < 90 ? 'Procesando en la nube...' :
                     uploadProgress < 100 ? 'Creando tarea de renderizado...' : '¡Listo! Redirigiendo...'}
                  </span>
                  <span className="text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              id="render-publish-btn"
              onClick={handleSubmit}
              disabled={isUploading || !videoFile}
              className="w-full py-4 px-4 rounded-xl font-bold text-white transition-all duration-200
                bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 text-lg"
            >
              {!isUploading && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              )}
              {isUploading ? 'Procesando...' : 'Renderizar y Publicar'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
