import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToYouTube, refreshYouTubeToken, mapPrivacyStatus } from '@/lib/youtube'

export const maxDuration = 300 // 5 minutos — la subida de video puede tardar

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
      // Renovar si ya expiró O vence en menos de 10 minutos (margen generoso)
      ? new Date(tokenRow.expires_at).getTime() - Date.now() < 10 * 60 * 1000
      : false  // Sin expires_at → asumir válido

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

      console.log('[publish/youtube] ✅ Token renovado y guardado. Nuevo expires_at:', newExpiresAt)
      }
    }

    // 6. Marcar el job como "publicando"
    await supabase
      .from('jobs')
      .update({ status: 'publishing' })
      .eq('id', jobId)

    // 7. Subir el video a YouTube
    console.log('[publish/youtube] Iniciando subida a YouTube para cliente:', clientId)
    const privacyStatus = mapPrivacyStatus(job.privacy || 'público')

    let uploadResult
    try {
      uploadResult = await uploadToYouTube(
        accessToken,
        job.video_url,
        job.title || 'Video sin título',
        job.description || '',
        privacyStatus,
      )
    } catch (uploadErr: unknown) {
      const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr)
      console.error('[publish/youtube] Error subiendo a YouTube:', msg)

      await supabase
        .from('jobs')
        .update({ status: 'error', error_message: msg })
        .eq('id', jobId)

      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // 8. Guardar el resultado en el job
    await supabase
      .from('jobs')
      .update({
        status:            'done',
        platform_video_id: uploadResult.videoId,
        error_message:     null,
      })
      .eq('id', jobId)

    console.log('[publish/youtube] ✅ Video publicado. ID de YouTube:', uploadResult.videoId)

    return NextResponse.json({
      success:  true,
      videoId:  uploadResult.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${uploadResult.videoId}`,
    })

  } catch (error) {
    console.error('[publish/youtube] Error general:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
