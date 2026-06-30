/**
 * lib/youtube.ts
 * Funciones para interactuar con la YouTube Data API v3
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const YT_UPLOAD_URL   = 'https://www.googleapis.com/upload/youtube/v3/videos'
const YT_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface YouTubeTokens {
  access_token: string
  expires_in: number
  token_type: string
  refresh_token?: string
}

export interface YouTubeChannelInfo {
  channelId: string
  channelTitle: string
}

export interface YouTubeUploadResult {
  videoId: string
  title: string
  status: string
}

// ─── Renovar access_token ──────────────────────────────────────────────────────

export async function refreshYouTubeToken(refreshToken: string): Promise<YouTubeTokens> {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type:    'refresh_token',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error al renovar token de YouTube: ${err}`)
  }

  return res.json() as Promise<YouTubeTokens>
}

// ─── Información del canal ─────────────────────────────────────────────────────

export async function getChannelInfo(accessToken: string): Promise<YouTubeChannelInfo> {
  const url = `${YT_CHANNELS_URL}?part=snippet&mine=true`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error al obtener información del canal: ${err}`)
  }

  const data = await res.json()
  const channel = data.items?.[0]
  if (!channel) throw new Error('No se encontró el canal de YouTube')

  return {
    channelId:    channel.id,
    channelTitle: channel.snippet.title,
  }
}

// ─── Subida de video (resumable upload) ──────────────────────────────────────

export async function uploadToYouTube(
  accessToken: string,
  videoUrl:    string,
  title:       string,
  description: string,
  privacyStatus: 'public' | 'private' | 'unlisted' = 'public',
): Promise<YouTubeUploadResult> {

  // Paso 1: Descargar el video desde Supabase Storage
  console.log('[YouTube] Descargando video:', videoUrl)
  const videoRes = await fetch(videoUrl)
  if (!videoRes.ok) {
    throw new Error(`No se pudo descargar el video: HTTP ${videoRes.status}`)
  }
  const videoBuffer = await videoRes.arrayBuffer()
  const contentLength = videoBuffer.byteLength
  const contentType   = videoRes.headers.get('content-type') || 'video/mp4'

  console.log(`[YouTube] Video descargado: ${(contentLength / 1024 / 1024).toFixed(2)} MB`)

  // Paso 2: Iniciar sesión de subida reanudable
  const metadata = {
    snippet: {
      title:       title.trim() || 'Video sin título',
      description: description || '',
      categoryId:  '22', // People & Blogs
    },
    status: {
      privacyStatus, // 'public' | 'private' | 'unlisted'
    },
  }

  const initRes = await fetch(
    `${YT_UPLOAD_URL}?uploadType=resumable&part=snippet,status`,
    {
      method:  'POST',
      headers: {
        Authorization:   `Bearer ${accessToken}`,
        'Content-Type':  'application/json; charset=UTF-8',
        'X-Upload-Content-Type': contentType,
        'X-Upload-Content-Length': String(contentLength),
      },
      body: JSON.stringify(metadata),
    }
  )

  if (!initRes.ok) {
    const errBody = await initRes.text()
    throw new Error(`Error al iniciar subida a YouTube: ${errBody}`)
  }

  const uploadUrl = initRes.headers.get('location')
  if (!uploadUrl) throw new Error('YouTube no devolvió la URL de subida reanudable')

  console.log('[YouTube] Sesión de subida iniciada, subiendo bytes...')

  // Paso 3: Subir el contenido del video en una sola petición
  const uploadRes = await fetch(uploadUrl, {
    method:  'PUT',
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type':   contentType,
      'Content-Length': String(contentLength),
    },
    body: videoBuffer,
  })

  if (!uploadRes.ok && uploadRes.status !== 201) {
    const errBody = await uploadRes.text()
    throw new Error(`Error al subir video a YouTube: ${errBody}`)
  }

  const result = await uploadRes.json()
  console.log('[YouTube] Video subido exitosamente. Video ID:', result.id)

  return {
    videoId: result.id,
    title:   result.snippet?.title ?? title,
    status:  result.status?.uploadStatus ?? 'uploaded',
  }
}

// ─── Helper: privacidad en español → YouTube API ──────────────────────────────

export function mapPrivacyStatus(privacy: string): 'public' | 'private' | 'unlisted' {
  const map: Record<string, 'public' | 'private' | 'unlisted'> = {
    'público':    'public',
    'public':     'public',
    'privado':    'private',
    'private':    'private',
    'no listado': 'unlisted',
    'unlisted':   'unlisted',
  }
  return map[privacy.toLowerCase()] ?? 'public'
}
