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

    // 2. Obtener los datos del formulario (ahora solo el video y datos opcionales)
    const formData = await request.formData()
    const video = formData.get('video') as File
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const tags = formData.get('tags') as string | null
    const privacy = formData.get('privacy') as string | null

    if (!video || !(video instanceof File)) {
      return NextResponse.json({ error: 'No se envió ningún video' }, { status: 400 })
    }

    // 3. Subir el video a Supabase Storage
    // const fileExt = video.name.split('.').pop()
    const sanitizedName = video.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${Date.now()}_${sanitizedName}`
    const filePath = `videos/${user.id}/${fileName}`

    const videoBuffer = await video.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, videoBuffer, {
        contentType: video.type || 'video/mp4',
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] Storage error:', uploadError)
      return NextResponse.json({ error: 'Error al subir el video' }, { status: 500 })
    }

    // 4. Obtener la URL pública del video
    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath)

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
      // Intentar limpiar el archivo subido en caso de error
      await supabase.storage.from('videos').remove([filePath])
      return NextResponse.json({ error: 'Error al crear el trabajo de publicación' }, { status: 500 })
    }

    // 6. Responder con job_id y URL pública
    return NextResponse.json({ success: true, job_id: job.id, videoUrl: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('[upload] Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
