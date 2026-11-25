'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from 'react-icons/fa'
import { SiPinterest, SiX, SiThreads } from 'react-icons/si'
import { Skeleton } from '@/components/ui/skeleton'
import {
  parseIngredoraMetadata,
  POSTY_PUBLISHING_PLATFORMS,
  type ParsedIngredoraMetadata,
  type PublishingPlatform,
} from '@/lib/ingredora-metadata'

interface SocialAccount {
  id: string
  client_id: string
  social_token_id: string | null
  platform: string
  username: string
  page_name: string | null
  created_at: string
}

interface SocialToken {
  id: string
  client_id: string
  user_id: string
  platform: string
  username: string
  page_name: string | null
  refresh_token: string | null
  expires_at: string | null
  created_at: string
}

// Cuenta unificada (genérica o token OAuth)
interface UnifiedAccount {
  id: string
  client_id: string
  platform: string
  username: string
  page_name: string | null
  source: 'generic' | 'token'
  // true = access_token expirado pero tiene refresh_token; renovación automática al publicar
  needsRenewal?: boolean
}

interface Client {
  id: string
  user_id: string
  name: string
  logo_url: string | null
  created_at: string
  client_social_accounts: SocialAccount[]
  social_tokens: SocialToken[]
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <FaYoutube className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />,
  instagram: <FaInstagram className="w-3.5 h-3.5" style={{ color: '#EC4899' }} />,
  facebook: <FaFacebook className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />,
  tiktok: <FaTiktok className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />,
  pinterest: <SiPinterest className="w-3.5 h-3.5" style={{ color: '#E60023' }} />,
  x: <SiX className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />,
  threads: <SiThreads className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />,
  linkedin: <FaLinkedin className="w-3.5 h-3.5" style={{ color: '#0A66C2' }} />,
  voxurn: (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
      <defs>
        <linearGradient id="voxGradUpload" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A2BE2" />
          <stop offset="100%" stopColor="#4A00E0" />
        </linearGradient>
        <linearGradient id="voxRingGradUpload" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A00E0" />
          <stop offset="50%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#00E1D9" />
        </linearGradient>
        <clipPath id="voxTopHalfUpload">
          <rect x="0" y="0" width="24" height="11.5" />
        </clipPath>
      </defs>
      <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGradUpload)" strokeWidth={2.5} transform="rotate(-15 12 11.5)" opacity="0.95" />
      <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGradUpload)" strokeWidth={1.5} transform="rotate(-15 12 11.5)" opacity="0.7" />
      <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGradUpload)" strokeWidth={1} transform="rotate(-15 12 11.5)" opacity="0.4" />
      <path d="M12 22 L1.5 2 h6.5 L12 12.5 L16 2 h6.5 L12 22 Z" fill="url(#voxGradUpload)" />
      <g clipPath="url(#voxTopHalfUpload)">
        <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGradUpload)" strokeWidth={2.5} transform="rotate(-15 12 11.5)" opacity="0.95" />
        <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGradUpload)" strokeWidth={1.5} transform="rotate(-15 12 11.5)" opacity="0.7" />
        <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGradUpload)" strokeWidth={1} transform="rotate(-15 12 11.5)" opacity="0.4" />
      </g>
    </svg>
  ),
}

export default function UploadPage() {
  const router = useRouter()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Metadatos del video
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [privacy, setPrivacy] = useState('Público')
  const [scheduledFor, setScheduledFor] = useState('')

  // Importación opcional de metadatos de Ingredora Content Studio.
  const [metadataFile, setMetadataFile] = useState<File | null>(null)
  const [platformMetadata, setPlatformMetadata] = useState<ParsedIngredoraMetadata | null>(null)
  const [activeMetadataPlatform, setActiveMetadataPlatform] = useState<PublishingPlatform>('youtube')
  const [metadataImportError, setMetadataImportError] = useState<string | null>(null)
  const [metadataImportNotice, setMetadataImportNotice] = useState<string | null>(null)
  const metadataInputRef = useRef<HTMLInputElement | null>(null)

  // Clients & Accounts selection
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, boolean>>({})
  const selectedRef = useRef<Record<string, boolean>>({})

  // Fetch clients on load
  useEffect(() => {
    async function getClients() {
      try {
        const res = await fetch('/api/clients', { cache: 'no-store' })
        if (res.ok) {
          const data: Client[] = await res.json()

          // ── DEBUG ─────────────────────────────────────────────────
          console.log('[upload] 🔍 Clientes completos:', data)
          data.forEach(client => {
            console.log(`[upload] 🔍 Cliente ${client.name} (${client.id}):`)
            console.log(`[upload] 🔍   client_social_accounts:`, client.client_social_accounts)
            console.log(`[upload] 🔍   social_tokens:`, (client as any).social_tokens)
            // Lógica aplazada porque getClientAccounts aún no está en scope, lo vemos abajo
          })
          if (data.length === 0) {
            console.log('⚠️ No se encontraron clientes para este usuario')
          }
          // ──────────────────────────────────────────────────────────

          setClients(data)

          // Preselect if client query param exists
          const urlParams = new URLSearchParams(window.location.search)
          const targetClientId = urlParams.get('client')
          if (targetClientId) {
            const client = data.find(c => c.id === targetClientId)
            if (client) {
              const preselected: Record<string, boolean> = {}
              const all = getClientAccounts(client)
              all.forEach(acc => { preselected[acc.id] = true })
              setSelectedAccounts(preselected)
            }
          }
        } else {
          console.error('⚠️ Error al obtener clientes. HTTP status:', res.status)
        }
      } catch (err) {
        console.error('Error fetching clients:', err)
      } finally {
        setLoadingClients(false)
      }
    }
    getClients()
  }, [])

  // Combina client_social_accounts + social_tokens.
  // REGLA: Un token con refresh_token SIEMPRE se muestra como conectado.
  // La renovación del access_token ocurre automáticamente al publicar.
  function getClientAccounts(client: Client): UnifiedAccount[] {
    const now = new Date()

    const generic: UnifiedAccount[] = (client.client_social_accounts || []).map(a => ({
      id:        a.id,
      client_id: a.client_id,
      platform:  a.platform,
      username:  a.username,
      page_name: a.page_name,
      source:    'generic' as const,
    }))

    const rawTokens = client.social_tokens || []
    const tokens: UnifiedAccount[] = []

    for (const t of rawTokens) {
      // Determinar estado del access_token
      let accessExpired = false
      if (t.expires_at) {
        accessExpired = new Date(t.expires_at) <= now
      }
      const isMetaPlatform = ['facebook', 'instagram', 'threads'].includes(t.platform)
      const hasRefresh = isMetaPlatform || !!t.refresh_token

      // Log de diagnóstico (consola del navegador)
      console.log(
        `[Token] ${t.platform} «${t.username}»`,
        `| expires_at: ${t.expires_at ?? 'null'}`,
        `| accessExpired: ${accessExpired}`,
        `| hasRefreshToken (or Meta): ${hasRefresh}`,
      )

      // ⚠️ Asegurar que se incluyen los tokens si tienen refresh_token o son Meta,
      // incluso si están expirados.
      if (accessExpired && !hasRefresh) {
        console.warn(`  ⚠️ Token sin refresh_token y expirado — se omite`)
        continue
      }

      // En todos los demás casos mostramos la cuenta:
      // - access_token válido (con o sin refresh)
      // - access_token expirado PERO con refresh_token (renovación al publicar)
      tokens.push({
        id:           t.id,
        client_id:    t.client_id,
        platform:     t.platform,
        username:     t.username,
        page_name:    t.page_name,
        source:       'token' as const,
        needsRenewal: accessExpired && hasRefresh,
      })
    }

    const all = [...generic, ...tokens]
    console.log(`[getClientAccounts] "${client.name}" → ${all.length} cuentas (${tokens.filter(t => t.needsRenewal).length} pendientes de renovación)`)
    if (all.length === 0) {
      console.warn(`  ⚠️ "${client.name}" no aparecerá en destinatarios`)
    }
    return all
  }

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setVideoFile(file)
    setError(null)
    setVideoPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
  })

  const fmtSize = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`

  async function handleMetadataFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setMetadataFile(file)
    setPlatformMetadata(null)
    setMetadataImportError(null)
    setMetadataImportNotice(null)

    if (!/\.txt$/i.test(file.name)) {
      setMetadataImportError('El archivo debe tener extensión .txt.')
      return
    }

    if (file.size > 256 * 1024) {
      setMetadataImportError('El TXT supera el límite de 256 KB.')
      return
    }

    try {
      const parsed = parseIngredoraMetadata(await file.text())
      setPlatformMetadata(parsed)

      // Posty todavía publica con sus campos generales. Durante esta etapa,
      // usamos @GLOBAL como base neutral para no aplicar el copy de una red a las demás.
      const youtube = parsed.platforms.youtube
      setTitle(parsed.global.title || youtube.title)
      setDescription(parsed.global.description || youtube.description)

      const sourceTags = parsed.global.tags || youtube.tags
      const importedTags: string[] = []
      let importedTagsLength = 0
      for (const rawTag of sourceTags.split(/[,;\n]/)) {
        const tag = rawTag.trim().replace(/^#/, '')
        if (!tag || importedTags.includes(tag) || importedTags.length >= 30) continue
        if (importedTagsLength + tag.length > 500) break
        importedTags.push(tag)
        importedTagsLength += tag.length
      }
      setTags(importedTags)
      setTagInput('')
      setError(null)
      setMetadataImportNotice(
        'TXT importado. Los campos generales se completaron con @GLOBAL. La vista por red es de consulta en esta etapa; Posty todavía publica con los campos generales. La edición y el envío de copys independientes se incorporarán en la siguiente etapa.',
      )
    } catch (importError) {
      setMetadataImportError(
        importError instanceof Error ? importError.message : 'No se pudo leer el TXT.',
      )
    }
  }

  function clearMetadataFile() {
    setMetadataFile(null)
    setPlatformMetadata(null)
    setMetadataImportError(null)
    setMetadataImportNotice(null)
    if (metadataInputRef.current) metadataInputRef.current.value = ''
  }

  // Toggle todas las cuentas de un cliente (usa lista unificada)
  const handleClientToggle = (client: Client) => {
    const all = getClientAccounts(client)
    const allSelected = all.every(acc => !!selectedAccounts[acc.id])
    setSelectedAccounts(prev => {
      const next = { ...prev }
      all.forEach(acc => {
        if (allSelected) delete next[acc.id]
        else next[acc.id] = true
      })
      return next
    })
  }

  // Toggle cuenta individual
  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => {
      const next = { ...prev }
      if (next[accountId]) delete next[accountId]
      else next[accountId] = true
      return next
    })
  }

  // Manejo de tags
  const addTag = (val: string) => {
    const newTag = val.trim().replace(/^#/, '') // Remove leading hash if any
    if (!newTag) return

    // Validations
    if (tags.includes(newTag)) {
      setTagInput('')
      return
    }
    if (tags.length >= 30) return
    
    const currentLength = tags.reduce((acc, curr) => acc + curr.length, 0)
    if (currentLength + newTag.length > 500) return

    setTags(prev => [...prev, newTag])
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // Opcional: borrar la última tag si el input está vacío y se presiona Backspace
      setTags(tags.slice(0, -1))
    }
  }

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // En móviles a veces no se captura el onKeyDown correctamente
    if (val.includes(',')) {
      const parts = val.split(',')
      addTag(parts[0])
    } else {
      setTagInput(val)
    }
  }

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove))
  }

  const tagsLength = tags.reduce((acc, curr) => acc + curr.length, 0)
  const metadataPreview = platformMetadata?.platforms[activeMetadataPlatform]
  const metadataPlatformHasBlock = platformMetadata?.hasPlatformBlock[activeMetadataPlatform] ?? false
  const metadataNamesMatch = !videoFile || !metadataFile ||
    videoFile.name.replace(/\.[^.]+$/, '').trim().toLowerCase() ===
    metadataFile.name.replace(/\.txt$/i, '').trim().toLowerCase()

  async function handleSubmit() {
    if (!videoFile) return setError('Por favor selecciona un video.')
    if (!title.trim()) return setError('El título es obligatorio.')
    
    if (privacy === 'Programado') {
      if (!scheduledFor) return setError('Por favor elige una fecha y hora para la publicación.')
      const minDate = new Date(Date.now() + 10 * 60000)
      if (new Date(scheduledFor) < minDate) return setError('La fecha de programación debe ser al menos 10 minutos en el futuro (requerido por Facebook y otras plataformas).')
    }
    
    // Validate that at least one account is selected
    const activeAccountIds = Object.keys(selectedAccounts).filter(id => !!selectedAccounts[id])
    if (activeAccountIds.length === 0) {
      return setError('Debes seleccionar al menos una cuenta de red social para publicar.')
    }

    setIsUploading(true)
    setError(null)
    setProgress(10)

    try {
      // ── Paso 1: Subir video a Supabase Storage (Subida directa al cliente) ──────────────────────────
      const interval = setInterval(() => setProgress(p => Math.min(p + 5, 60)), 600)
      
      console.log('[upload page] 1. Obteniendo URL prefirmada...')
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: videoFile.name, fileType: videoFile.type })
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) {
        clearInterval(interval)
        throw new Error(urlData.error ?? 'Error al obtener URL de subida.')
      }
      
      console.log('[upload page] ⏳ Subiendo archivo...')
      console.log(`[upload page] 📤 Tamaño: ${videoFile.size} bytes`)
      console.log(`[upload page] 🔗 Método: PUT`)
      console.log(`[upload page] 🗂️ Content-Type: ${videoFile.type}`)

      const uploadRes = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: videoFile,
        headers: { 'Content-Type': videoFile.type }
      })

      // Leer cuerpo de la respuesta ANTES de cualquier condición
      const uploadResText = await uploadRes.text().catch(() => '')
      console.log(`[upload page] 📡 Respuesta del PUT: ${uploadRes.status} ${uploadRes.statusText}`)
      console.log(`[upload page] 📄 Cuerpo de la respuesta:`, uploadResText)

      if (!uploadRes.ok) {
        clearInterval(interval)
        throw new Error(`Error al subir el video: ${uploadRes.status} ${uploadRes.statusText} - ${uploadResText}`)
      }

      // Usar la URL pública que calculó el servidor (evita problemas de duplicación de paths)
      console.log(`[upload page] 🔗 filePath recibido:`, urlData.filePath)
      const publicUrl = urlData.publicUrl
      console.log(`[upload page] 🌐 publicUrl (del servidor):`, publicUrl)

      // Verificar que el archivo sea accesible (HEAD request)
      const checkRes = await fetch(publicUrl, { method: 'HEAD' }).catch(() => null)
      if (!checkRes || !checkRes.ok) {
        console.warn('[upload page] ⚠️ El archivo no está accesible inmediatamente. Puede tardar unos segundos.')
      }
      
      console.log('[upload page] 3. Creando job...')
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          tags,
          privacy,
          videoUrl: publicUrl,
          scheduled_for: privacy === 'Programado' ? new Date(scheduledFor).toISOString() : undefined
        })
      })
      clearInterval(interval)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al registrar el video.')

      setProgress(65)
      const jobId = data.job_id

      // ── Paso 2: Identificar cuentas seleccionadas ─────────────
      console.log('[upload page] ✅ Video subido a Storage. Job ID:', jobId)
      const publishPromises: Promise<Response>[] = []

      console.log('[upload] 🔍 selectedAccounts al inicio de handleSubmit:', selectedAccounts)
      
      const allAccounts = clients.flatMap(c => getClientAccounts(c))
      const selectedAccountsList = Object.keys(selectedAccounts).filter(id => selectedAccounts[id])
      
      console.log('[upload] 🚀 handleSubmit: selectedAccounts =', selectedAccounts)
      console.log('[upload] 🚀 handleSubmit: keys =', Object.keys(selectedAccounts))
      console.log('[upload] 📦 Cuentas seleccionadas:', selectedAccountsList)
      
      // Si hay cuentas seleccionadas, mostrar sus detalles
      Object.keys(selectedAccounts).forEach(id => {
        if (selectedAccounts[id]) {
          const account = allAccounts.find(a => a.id === id)
          console.log(`[upload] 🚀 Cuenta seleccionada ${id}:`, account)
        }
      })

      console.log('[upload] 🔍 allAccounts completo:', allAccounts)
      console.log('[upload] 🔍 Buscando cuenta con ID "7":', allAccounts.find(a => a.id === '7'))
      
      // Reconstruir selecciones por cliente usando getClientAccounts directamente
      // Esto evita problemas de tipo (int vs string) y client_id nulo
      const accountsByClient: Record<string, typeof allAccounts> = {}
      clients.forEach(client => {
        const clientAccounts = getClientAccounts(client)
        const selectedForClient = clientAccounts.filter(acc =>
          // Comparar como string para evitar int vs string
          selectedAccountsList.includes(acc.id) || selectedAccountsList.includes(String(acc.id))
        )
        if (selectedForClient.length > 0) {
          accountsByClient[client.id] = selectedForClient
        }
      })

      console.log('[upload] 📦 Cuentas por cliente:', accountsByClient)

      // Para cada cliente, verificar qué plataformas OAuth están seleccionadas
      const OAUTH_PLATFORMS = ['youtube', 'facebook', 'instagram', 'threads']
      for (const [clientId, accounts] of Object.entries(accountsByClient)) {
        const selectedOauthPlatforms = OAUTH_PLATFORMS.filter(platform => 
          accounts.some(a => a.platform === platform)
        )
        
        console.log(`[upload] 📦 Plataformas seleccionadas (cliente ${clientId}):`, selectedOauthPlatforms)
        
        if (selectedOauthPlatforms.length === 0) {
          const client = clients.find(c => c.id === clientId)
          throw new Error(`El cliente ${client?.name || clientId} no tiene ninguna plataforma OAuth válida seleccionada.`)
        }

        // Llamar a /api/publish/[platform] por cada plataforma seleccionada
        for (const platform of selectedOauthPlatforms) {
          console.log(`[upload] 🚀 Publicando en ${platform} para cliente ${clientId}`)
          publishPromises.push(
            fetch(`/api/publish/${platform}`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jobId, clientId }),
            })
          )
        }
      }

      if (publishPromises.length === 0) {
        throw new Error('No se seleccionó ninguna cuenta para publicar.')
      }

      setProgress(75)
      // Esperamos todas las peticiones a la API
      const results = await Promise.all(publishPromises)
      
      // Verificar las respuestas
      for (const r of results) {
        const text = await r.text()
        let errData
        try {
          errData = JSON.parse(text)
        } catch (e) {
          console.error('❌ La respuesta de /api/publish no es JSON válido:', text)
          // Ignoramos HTML errors si status es 404 (ej. endpoint no implementado aún)
          if (!r.ok && r.status !== 404) {
            throw new Error(`Error del servidor (HTTP ${r.status}). Revisa los logs de Vercel.`)
          }
        }
        
        if (!r.ok) {
          // Si el endpoint no existe (404), lanzamos error custom amigable
          if (r.status === 404) {
            throw new Error('El método de publicación para esta plataforma aún no está implementado.')
          }
          throw new Error(errData?.error ?? `Error publicando (HTTP ${r.status})`)
        }
      }
      setProgress(95)

      setProgress(100)
      setTimeout(() => router.push(`/dashboard/jobs/${jobId}`), 400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: '#6A7E94' }}>
          <Link href="/dashboard" className="font-medium transition-colors hover:text-[#F0F4F8]" style={{ color: '#6A7E94' }}>
            Dashboard
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-semibold" style={{ color: '#F0F4F8' }}>Nueva publicación</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold mb-3 tracking-tighter" style={{ color: '#F0F4F8' }}>
            Sube y publica tu video
          </h1>
          <p className="leading-relaxed" style={{ color: '#A8B8C8' }}>
            Tu video ya editado se distribuirá en las cuentas de redes sociales de tus clientes.
          </p>
        </div>

        {/* Card principal */}
        <div
          className="p-8 rounded-3xl shadow-md space-y-8"
          style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
        >
          {/* Dropzone */}
          <div
            {...getRootProps()}
            id="video-dropzone"
            className="rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden"
            style={{
              border: `2px dashed ${isDragActive ? '#1A6B8A' : videoFile ? '#22C55E' : '#334155'}`,
              backgroundColor: isDragActive ? 'rgba(26,107,138,0.05)' : videoFile ? 'rgba(34,197,94,0.05)' : '#181E26',
            }}
          >
            <input {...getInputProps()} id="video-input" />

            {videoFile && videoPreview ? (
              /* Preview */
              <div className="relative">
                <video src={videoPreview} className="w-full max-h-72 object-contain bg-black" controls muted playsInline />
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md"
                  style={{ backgroundColor: 'rgba(24,30,38,0.85)', color: '#4ADE80', backdropFilter: 'blur(8px)', border: '1px solid #334155' }}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Listo
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="py-20 flex flex-col items-center gap-4 px-8 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: isDragActive ? '#1A6B8A' : '#232B36',
                    border: `1px solid ${isDragActive ? 'transparent' : '#334155'}`,
                    transform: isDragActive ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isDragActive ? '0 10px 25px -5px rgba(26,107,138,0.5)' : '0 4px 6px -1px rgba(0,0,0,0.3)'
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: isDragActive ? '#F0F4F8' : '#1A6B8A' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                {isDragActive ? (
                  <p className="text-xl font-bold tracking-tight" style={{ color: '#1A6B8A' }}>¡Suelta el video aquí!</p>
                ) : (
                  <>
                    <p className="text-xl font-bold tracking-tight" style={{ color: '#F0F4F8' }}>Arrastra tu video aquí</p>
                    <p className="leading-relaxed text-sm" style={{ color: '#A8B8C8' }}>o haz clic para seleccionar desde tu computadora</p>
                    <span
                      className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#181E26', border: '1px solid #334155', color: '#6A7E94' }}
                    >
                      MP4, MOV, AVI · máx 500 MB
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Rejection error */}
          {fileRejections.length > 0 && (
            <div
              className="flex items-center gap-2 p-4 rounded-xl text-sm border"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', color: '#F87171' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{fileRejections[0].errors[0].message}</span>
            </div>
          )}

          {/* File info */}
          {videoFile && (
            <div
              className="flex items-center justify-between p-4 rounded-xl shadow-sm"
              style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}>
                  <svg className="w-6 h-6" style={{ color: '#1A6B8A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate tracking-tight" style={{ color: '#F0F4F8' }}>{videoFile.name}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: '#A8B8C8' }}>{fmtSize(videoFile.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null) }}
                className="ml-3 p-2 rounded-xl transition-all duration-200 flex-shrink-0"
                style={{ color: '#6A7E94' }}
                title="Eliminar archivo"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Importación opcional del TXT de Ingredora Content Studio */}
          <div className="border-t border-[#334155] pt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <label htmlFor="metadata-file-input" className="block text-sm font-bold text-[#F0F4F8]">
                  TXT de metadatos de Ingredora <span className="text-xs font-medium text-[#A8B8C8]">(opcional)</span>
                </label>
                {metadataFile && (
                  <button
                    type="button"
                    onClick={clearMetadataFile}
                    disabled={isUploading}
                    className="text-xs font-semibold text-[#F87171] hover:text-white disabled:opacity-50"
                  >
                    Quitar TXT
                  </button>
                )}
              </div>
              <input
                ref={metadataInputRef}
                id="metadata-file-input"
                type="file"
                accept=".txt,text/plain"
                onChange={handleMetadataFileChange}
                disabled={isUploading}
                className="block w-full text-sm text-[#A8B8C8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1A6B8A] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#237f9f] disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-[#6A7E94]">
                Seleccioná el TXT con el mismo nombre base que el MP4. Posty reconoce el formato INGREDORA_PUBLISHING_TEMPLATE_V1.
              </p>
              {metadataFile && (
                <p className="mt-2 text-xs text-[#A8B8C8]">
                  Archivo: <span className="font-semibold text-[#F0F4F8]">{metadataFile.name}</span>
                </p>
              )}
              {metadataFile && videoFile && !metadataNamesMatch && (
                <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  El nombre base del TXT no coincide con el MP4 ({videoFile.name.replace(/\.[^.]+$/, '')}). Revisá que hayas elegido el archivo correcto.
                </p>
              )}
              {metadataImportError && (
                <p role="alert" className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {metadataImportError}
                </p>
              )}
              {metadataImportNotice && (
                <p role="status" className="mt-2 rounded-lg border border-[#1A6B8A]/50 bg-[#1A6B8A]/10 px-3 py-2 text-xs leading-relaxed text-[#B8E6F5]">
                  {metadataImportNotice}
                </p>
              )}
            </div>

            {platformMetadata && metadataPreview && (
              <div className="rounded-2xl border border-[#334155] bg-[#181E26] p-4 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#F0F4F8]">Vista previa de metadatos por red</h3>
                    <p className="mt-1 text-xs text-[#A8B8C8]">
                      {metadataPlatformHasBlock
                        ? 'Datos de @GLOBAL + @' + activeMetadataPlatform.toUpperCase()
                        : 'Datos heredados de @GLOBAL; el TXT no incluye un bloque propio para esta red.'}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#334155] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#A8B8C8]">
                    TXT V1
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {POSTY_PUBLISHING_PLATFORMS.map(platform => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setActiveMetadataPlatform(platform.id)}
                      aria-pressed={activeMetadataPlatform === platform.id}
                      className={'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ' + (
                        activeMetadataPlatform === platform.id
                          ? 'border-[#1A6B8A] bg-[#1A6B8A]/20 text-white'
                          : 'border-[#334155] bg-[#232B36] text-[#A8B8C8] hover:border-[#1A6B8A]'
                      )}
                    >
                      {PLATFORM_ICONS[platform.id]}
                      {platform.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {([
                    ['Título', metadataPreview.title],
                    ['Descripción', metadataPreview.description],
                    ['Hashtags', metadataPreview.hashtags],
                    ['Tags', metadataPreview.tags],
                    ['Comentario para fijar', metadataPreview.pinnedComment],
                    ['Texto alternativo', metadataPreview.altText],
                  ] as const).map(([label, value]) => (
                    <div key={label}>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#6A7E94]">{label}</p>
                      <p className="whitespace-pre-wrap break-words rounded-lg border border-[#334155]/70 bg-[#232B36] px-3 py-2 text-xs leading-relaxed text-[#DCE5EF]">
                        {value || <span className="italic text-[#6A7E94]">Sin contenido en el TXT</span>}
                      </p>
                    </div>
                  ))}
                </div>

                {platformMetadata.warnings.map((warning, index) => (
                  <p key={index} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
                    {warning}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Metadatos del video */}
          <div className="border-t border-[#334155] pt-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#F0F4F8] mb-1.5">Título <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Nuevo video promocional"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F0F4F8] placeholder-[#6A7E94] focus:outline-none focus:ring-2 focus:ring-[#1A6B8A] transition-all"
                style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#F0F4F8] mb-1.5">Descripción / Caption</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe lo que acompañará a tu video..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F0F4F8] placeholder-[#6A7E94] focus:outline-none focus:ring-2 focus:ring-[#1A6B8A] transition-all resize-none"
                style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#F0F4F8] mb-1.5">Tags / Hashtags</label>
                <div 
                  className="w-full px-3 py-2 rounded-xl flex flex-wrap gap-2 items-center transition-all cursor-text focus-within:ring-2 focus-within:ring-[#1A6B8A]"
                  style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}
                  onClick={() => document.getElementById('tag-input')?.focus()}
                >
                  {tags.map((tag, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#334155', color: '#F0F4F8' }}
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeTag(idx) }}
                        className="text-[#F87171] hover:text-white transition-colors p-0.5 rounded-full hover:bg-red-500/20"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <input
                    id="tag-input"
                    type="text"
                    value={tagInput}
                    onChange={handleTagChange}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) addTag(tagInput)
                    }}
                    placeholder={tags.length === 0 ? "marketing, tips, viral (presiona Enter o coma)" : ""}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-[#F0F4F8] placeholder-[#6A7E94] focus:outline-none"
                    disabled={tags.length >= 30 || tagsLength >= 500}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-[#A8B8C8]">
                    {tags.length}/30 tags
                  </p>
                  <p className="text-xs text-[#A8B8C8]">
                    {tagsLength}/500 caracteres
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#F0F4F8] mb-1.5">Visibilidad</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F0F4F8] focus:outline-none focus:ring-2 focus:ring-[#1A6B8A] transition-all appearance-none"
                  style={{ backgroundColor: '#181E26', border: '1px solid #334155', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236A7E94' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="Público">Público</option>
                  <option value="Privado">Privado</option>
                  <option value="No listado">No listado</option>
                  <option value="Programado">Programado</option>
                </select>
              </div>
            </div>

            {privacy === 'Programado' && (
              <div>
                <label className="block text-sm font-bold text-[#F0F4F8] mb-1.5">Fecha y hora de publicación <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  onClick={(e) => {
                    try {
                      if ('showPicker' in HTMLInputElement.prototype) {
                        (e.currentTarget as any).showPicker()
                      }
                    } catch (err) {
                      // fallback for older browsers
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F0F4F8] placeholder-[#6A7E94] focus:outline-none focus:ring-2 focus:ring-[#1A6B8A] transition-all cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 relative"
                  style={{ 
                    backgroundColor: '#181E26', 
                    border: '1px solid #334155', 
                    colorScheme: 'dark',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236A7E94' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                />
                <p className="text-xs text-[#A8B8C8] mt-1.5">
                  El video se subirá a YouTube como "Privado" y pasará a "Público" en la fecha indicada.
                </p>
              </div>
            )}
          </div>

          {/* Selector de Clientes y Cuentas */}
          <div className="border-t border-[#334155] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#F0F4F8]">Selecciona los destinatarios</h3>
              
              {/* Botón Debug */}
              <button
                type="button"
                onClick={() => {
                  console.log('[debug] selectedAccounts:', selectedAccounts)
                  const allAccs = clients.flatMap(c => getClientAccounts(c))
                  console.log('[debug] allAccounts:', allAccs)
                  console.log('[debug] getClientAccounts para cada cliente:')
                  clients.forEach(c => console.log(c.name, getClientAccounts(c)))
                }}
                className="px-3 py-1 rounded bg-[#334155] text-xs font-bold text-white hover:bg-[#1A6B8A] transition-colors"
              >
                Debug
              </button>
            </div>
            
            {loadingClients ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="p-4 rounded-xl border" style={{ backgroundColor: '#181E26', borderColor: '#334155' }}>
                    <div className="flex items-center gap-3 pb-3 border-b border-[#334155]/40 mb-3">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-7">
                      <Skeleton className="h-12 rounded-lg" />
                      <Skeleton className="h-12 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (() => {
              // Filtrar clientes que tienen al menos una cuenta conectada
              const clientsWithAccounts = clients
                .map(client => ({ client, accounts: getClientAccounts(client) }))
                .filter(({ accounts }) => accounts.length > 0)

              if (clients.length === 0) {
                return (
                  <div className="p-5 rounded-xl border border-dashed border-[#334155] text-center bg-[#181E26]">
                    <p className="text-sm mb-3" style={{ color: '#A8B8C8' }}>No tienes clientes configurados.</p>
                    <Link href="/dashboard" className="text-xs font-bold text-[#1A6B8A] hover:underline">
                      Configurar clientes en el Dashboard →
                    </Link>
                  </div>
                )
              }

              if (clientsWithAccounts.length === 0) {
                return (
                  <div className="p-5 rounded-xl border border-dashed border-[#334155] text-center bg-[#181E26]">
                    <p className="text-sm mb-3" style={{ color: '#A8B8C8' }}>Ningún cliente tiene redes sociales conectadas.</p>
                    <Link href="/dashboard/accounts" className="text-xs font-bold text-[#1A6B8A] hover:underline">
                      Ir a Mis Clientes para conectar redes →
                    </Link>
                  </div>
                )
              }

              return (
                <div className="space-y-4">
                  {clientsWithAccounts.map(({ client, accounts }) => {
                    console.log(`[upload] 📋 Cuentas disponibles para cliente ${client.name}:`, accounts)
                    return (
                      <div
                        key={client.id}
                        className="p-4 rounded-xl border"
                        style={{ backgroundColor: '#181E26', borderColor: '#334155' }}
                      >
                        {/* Client Header Checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer select-none pb-3 border-b border-[#334155]/40 mb-3">
                          <input
                            type="checkbox"
                            checked={accounts.length > 0 && accounts.every(acc => selectedAccounts[acc.id])}
                            onChange={(e) => {
                              const isChecked = e.target.checked
                              const clientAccounts = getClientAccounts(client)
                              console.log(`[upload] 🖱️ Cliente ${client.name} (${client.id}) marcado = ${isChecked}`)
                              console.log(`[upload] 📋 Cuentas a marcar:`, clientAccounts.map(a => a.id))
                              setSelectedAccounts(prev => {
                                const newState = { ...prev }
                                clientAccounts.forEach(acc => {
                                  newState[acc.id] = isChecked
                                })
                                console.log(`[upload] 📦 Nuevo selectedAccounts:`, newState)
                                return newState
                              })
                            }}
                            className="w-4 h-4 rounded accent-[#1A6B8A]"
                          />
                          <span className="text-sm font-bold text-[#F0F4F8]">{client.name}</span>
                        </label>

                        {/* Client Accounts — solo las conectadas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                          {accounts.map(acc => (
                            <label
                              key={acc.id}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#232B36] border border-[#334155]/60 hover:border-[#1A6B8A] cursor-pointer select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedAccounts[acc.id]}
                                onChange={(e) => {
                                  const isChecked = e.target.checked
                                  setSelectedAccounts(prev => ({ ...prev, [acc.id]: isChecked }))
                                }}
                                className="w-3.5 h-3.5 rounded accent-[#1A6B8A] flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#F0F4F8] truncate">{acc.page_name || acc.username}</p>
                                <div className="text-[10px] flex items-center gap-1.5 mt-0.5" style={{ color: '#A8B8C8' }}>
                                  {PLATFORM_ICONS[acc.platform]}
                                  <span>{acc.username.startsWith('@') ? acc.username : `@${acc.username}`}</span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-6 flex items-start gap-3 p-4 rounded-xl text-sm border shadow-sm"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', color: '#F87171' }}
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div
            className="mt-6 p-6 rounded-2xl shadow-md"
            style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
          >
            <div className="flex justify-between text-sm font-bold mb-4 tracking-tight" style={{ color: '#F0F4F8' }}>
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" style={{ color: '#1A6B8A' }} viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                📤 Subiendo y publicando...
              </span>
              <span style={{ color: '#1A6B8A' }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#181E26' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: '#1A6B8A' }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          id="publish-btn"
          onClick={handleSubmit}
          disabled={isUploading || !videoFile}
          className="mt-8 w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3 cursor-pointer"
          style={{ backgroundColor: '#1A6B8A' }}
        >
          {!isUploading && (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
          {isUploading ? '📤 Subiendo y publicando...' : 'Publicar'}
        </button>
      </main>
    </div>
  )
}
