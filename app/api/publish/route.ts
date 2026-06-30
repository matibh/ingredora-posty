import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Permitimos hasta 60s en caso de que las APIs tarden un poco más (Vercel Pro+)
export const maxDuration = 60

/**
 * Endpoint encargado de procesar la publicación en paralelo a las redes sociales
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Autenticar usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Extraer job_id del body
    const body = await request.json().catch(() => null)
    if (!body || !body.job_id) {
      return NextResponse.json({ error: 'Falta job_id' }, { status: 400 })
    }
    const { job_id } = body

    // 3. Validar la existencia del job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job no encontrado o sin acceso' }, { status: 404 })
    }

    if (job.status !== 'pending' && job.status !== 'error') {
      return NextResponse.json({ error: 'El job ya fue procesado o está en proceso' }, { status: 400 })
    }

    // 4. Marcar como publicando
    await supabase.from('jobs').update({ status: 'publishing' }).eq('id', job_id)

    // 5. Obtener los tokens sociales del usuario (Asumimos una tabla `social_tokens`)
    // const { data: tokens } = await supabase.from('social_tokens').select('*').eq('user_id', user.id)
    // De momento, emulamos la ausencia de la tabla y dejamos el flujo preparado.
    // const tokens = [] as { platform: string }[]

    try {
      // 6. Publicar en paralelo (Promise.all)
      // Se ejecutan simultáneamente y el tiempo será el del request más lento
      const publishPromises = [
        publishToYouTube(job.video_url),
        publishToInstagram(job.video_url),
        publishToFacebook(job.video_url),
        publishToTikTok(job.video_url)
      ]

      await Promise.all(publishPromises)

      // 7. Si todo es exitoso, actualizamos a done
      await supabase.from('jobs').update({ status: 'done' }).eq('id', job_id)

      return NextResponse.json({ success: true, status: 'done' })

    } catch (publishError: unknown) {
      // 8. Manejo de error si alguna falla
      const errorMessage = publishError instanceof Error ? publishError.message : String(publishError)
      console.error('[publish] Error publicando:', publishError)
      await supabase
        .from('jobs')
        .update({ 
          status: 'error', 
          error_message: errorMessage || 'Error desconocido publicando el video' 
        })
        .eq('id', job_id)

      return NextResponse.json({ error: 'Hubo un error publicando en las redes', detail: errorMessage }, { status: 500 })
    }

  } catch (error) {
    console.error('[publish] Error general:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ─── Funciones esqueleto de publicación ──────────────────────────────────────

async function publishToYouTube(videoUrl: string) {
  // if (!tokenData) return // Descomentar para saltear si no está conectada
  
  // TO DO: Manejo de renovación automática de refresh token si access_token expiró
  // TO DO: Usar API de YouTube Data v3
  
  // Emulación de carga para testing
  await new Promise(res => setTimeout(res, 2000))
  console.log(`[YouTube] Simulación publicación de video: ${videoUrl}`)
  return true
}

async function publishToInstagram(videoUrl: string) {
  // TO DO: Usar Graph API (Page Access Token y Instagram Account ID)
  await new Promise(res => setTimeout(res, 2500))
  console.log(`[Instagram] Simulación publicación de video: ${videoUrl}`)
  return true
}

async function publishToFacebook(videoUrl: string) {
  // TO DO: Usar Graph API (Page Token)
  await new Promise(res => setTimeout(res, 1500))
  console.log(`[Facebook] Simulación publicación de video: ${videoUrl}`)
  return true
}

async function publishToTikTok(videoUrl: string) {
  // TO DO: Usar Content Posting API
  await new Promise(res => setTimeout(res, 3000))
  console.log(`[TikTok] Simulación publicación de video: ${videoUrl}`)
  return true
}
