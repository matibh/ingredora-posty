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
    
    // Extraer el filePath desde la publicUrl para verificar existencia
    // publicUrl = https://xxx.supabase.co/storage/v1/object/public/videos/userId/filename
    const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
    if (videoUrl.startsWith(supabaseStoragePrefix)) {
      const filePath = videoUrl.replace(supabaseStoragePrefix, '') // e.g. "videos/userId/filename"
      const pathParts = filePath.split('/')
      const folder = pathParts.slice(0, -1).join('/') // e.g. "videos/userId"
      const fileName = pathParts[pathParts.length - 1]

      console.log(`[upload] 🔍 Verificando existencia del archivo: ${filePath}`)
      const { data: fileExists, error: checkError } = await supabase.storage
        .from('videos')
        .list(folder, { search: fileName })

      if (checkError) {
        console.warn(`[upload] ⚠️ No se pudo verificar el archivo (${checkError.message}), continuando de todas formas.`)
      } else if (!fileExists || fileExists.length === 0) {
        console.error(`[upload] ❌ El archivo no existe en Storage: ${filePath}`)
        return NextResponse.json({ error: 'El archivo no se subió correctamente o aún no está disponible.' }, { status: 400 })
      } else {
        console.log(`[upload] ✅ Archivo verificado en Storage: ${fileName}`)
      }
    }

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
