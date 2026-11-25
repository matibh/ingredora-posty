import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToYouTube, refreshYouTubeToken, mapPrivacyStatus } from '@/lib/youtube'
import { getPlatformMetadata, appendMetadataHashtags } from '@/lib/platform-metadata'

export const maxDuration = 300 // 5 minutos — la subida de video puede tardar

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Autenticar usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Parsear body
    const body = await request.json().catch(() => null)
    if (!body?.jobId || !body?.clientId) {
      return NextResponse.json({ error: 'Faltan jobId o clientId' }, { status: 400 })
    }
    const { jobId, clientId } = body

    // 3. Obtener el job — validar que pertenece al usuario
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 })
    }

    // 4. Obtener el token de YouTube para este cliente
    const { data: tokenRow, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .eq('platform', 'youtube')
      .single()

    if (tokenError || !tokenRow) {
      return NextResponse.json(
        { error: 'El cliente no tiene YouTube conectado' },
        { status: 400 }
      )
    }

    // 5. Verificar si el token necesita renovación
    let accessToken = tokenRow.access_token
    const needsRefresh = tokenRow.expires_at
      ? new Date(tokenRow.expires_at).getTime() - Date.now() < 10 * 60 * 1000
      : false

    if (needsRefresh) {
      if (!tokenRow.refresh_token) {
        const errMsg = 'El token de YouTube expiró y no hay refresh_token. Ve a Mis Clientes y reconecta YouTube.'
        await supabase.from('jobs').update({ status: 'error', error_message: errMsg }).eq('id', jobId)
        return NextResponse.json({ error: errMsg }, { status: 400 })
      }

      console.log('[publish/youtube] Token expirado o próximo a expirar — renovando...')
      const refreshed = await refreshYouTubeToken(tokenRow.refresh_token)
      accessToken = refreshed.access_token

      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
      await supabase
        .from('social_tokens')
        .update({ access_token: refreshed.access_token, expires_at: newExpiresAt })
        .eq('id', tokenRow.id)

      console.log('[publish/youtube] ✅ Token renovado. Nuevo expires_at:', newExpiresAt)
    }

    // 6. Marcar el job como "publicando"
    await supabase.from('jobs').update({ status: 'publishing' }).eq('id', jobId)

    // 7. Subir el video a YouTube
    console.log('[publish/youtube] Iniciando subida para cliente:', clientId)
    const privacyStatus = mapPrivacyStatus(job.privacy || 'público')
    const publishAt = job.scheduled_for ? new Date(job.scheduled_for).toISOString() : undefined

    if (publishAt) console.log('[publish/youtube] 📅 Video programado para:', publishAt)

    let uploadResult
    try {
      const platformMetadata = getPlatformMetadata(job, 'youtube')
      uploadResult = await uploadToYouTube(
        accessToken,
        job.video_url,
        platformMetadata.title || 'Video sin título',
        appendMetadataHashtags(platformMetadata.description, platformMetadata.hashtags),
        platformMetadata.tags,
        privacyStatus,
        publishAt,
      )
    } catch (uploadErr: unknown) {
      const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr)
      console.error('[publish/youtube] Error subiendo a YouTube:', msg)
      await supabase.from('jobs').update({ status: 'error', error_message: msg }).eq('id', jobId)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    const videoId = uploadResult.videoId
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    console.log('[publish/youtube] 🆔 Video ID guardado:', videoId)
    console.log('[publish/youtube] 🔗 URL:', videoUrl)

    // 8. Leer platform_video_url existente y combinar con YouTube
    const { data: currentJob } = await supabase.from('jobs').select('platform_video_url').eq('id', jobId).single()
    let existingUrls: Record<string, string> = {}
    if (currentJob?.platform_video_url) {
      try { existingUrls = JSON.parse(currentJob.platform_video_url) } catch {}
    }
    const updatedUrls = { ...existingUrls, youtube: videoUrl }

    // 9. Guardar resultado en el job
    await supabase
      .from('jobs')
      .update({
        status:             'done',
        platform_video_id:  videoId,          // retrocompat con código anterior
        platform_video_url: JSON.stringify(updatedUrls),
        error_message:      null,
      })
      .eq('id', jobId)

    return NextResponse.json({
      success:  true,
      videoId,
      videoUrl,
    })

  } catch (error) {
    console.error('[publish/youtube] Error general:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
