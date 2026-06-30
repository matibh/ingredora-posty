import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Allow large video uploads — raise if needed
export const maxDuration = 60 // seconds (Vercel Pro+)

export async function POST(request: Request) {
  try {
    // 1. Obtener el usuario autenticado
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Obtener los datos del JSON
    const body = await request.json()
    const { videoUrl, title, description, tags, privacy } = body

    if (!videoUrl) {
      return NextResponse.json({ error: 'Falta la URL del video' }, { status: 400 })
    }

    const publicUrl = videoUrl

    // 5. Crear el trabajo en la tabla jobs (ahora simplificada)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        video_url: publicUrl,
        status: 'pending',
        title: title || '',
        description: description || '',
        tags: tags || '',
        privacy: privacy || 'Público'
      })
      .select()
      .single()

    if (jobError) {
      console.error('[upload] Job insert error:', jobError)
      return NextResponse.json({ error: 'Error al crear el trabajo de publicación' }, { status: 500 })
    }

    // 6. Responder con job_id y URL pública
    console.log('[upload] ✅ Subida exitosa a Storage. URL:', publicUrl)
    console.log('[upload] ✅ Job creado. ID:', job.id)
    return NextResponse.json({ success: true, job_id: job.id, videoUrl: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('[upload] Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
