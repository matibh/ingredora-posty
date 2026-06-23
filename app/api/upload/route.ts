import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Obtener el usuario autenticado
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Obtener los datos del formulario
    const formData = await request.formData()
    const video = formData.get('video') as File
    const template = (formData.get('template') as string) || 'classic'
    const overlayText = (formData.get('overlayText') as string) || ''

    if (!video) {
      return NextResponse.json({ error: 'No se envió ningún video' }, { status: 400 })
    }

    // 3. Subir el video a Supabase Storage
    const fileExt = video.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `videos/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, video, {
        contentType: video.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error al subir el video:', uploadError)
      return NextResponse.json({ error: 'Error al subir el video' }, { status: 500 })
    }

    // 4. Obtener la URL pública del video
    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath)

    // 5. Crear el trabajo en la tabla jobs
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        input_video_path: filePath,
        template,
        overlay_text: overlayText,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error al crear el trabajo:', jobError)
      // Intentar limpiar el archivo subido
      await supabase.storage.from('videos').remove([filePath])
      return NextResponse.json({ error: 'Error al crear el trabajo' }, { status: 500 })
    }

    // 6. Responder con job_id y URL pública
    return NextResponse.json({ success: true, job: job, videoUrl: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Error en upload:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
