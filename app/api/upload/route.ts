import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cleanOrphanVideos } from '@/lib/storage-cleanup'

// Allow large video uploads — raise if needed
export const maxDuration = 60 // seconds (Vercel Pro+)

export async function POST(request: Request) {
  // Ejecutar limpieza de videos huérfanos en segundo plano (sin bloquear)
  if (process.env.NODE_ENV !== 'development') {
    cleanOrphanVideos().catch(err => console.error('[cleanOrphanVideos] Error en limpieza:', err))
  }

  try {
    // 1. Obtener el usuario autenticado
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Obtener los datos del JSON
    const body = await request.json()
    const { videoUrl, title, description, tags, privacy, scheduled_for, platform_metadata } = body

    if (!videoUrl) {
      return NextResponse.json({ error: 'Falta la URL del video' }, { status: 400 })
    }

    let normalizedPlatformMetadata: Record<string, unknown> | undefined

    if (platform_metadata !== undefined) {
      if (
        !platform_metadata ||
        typeof platform_metadata !== 'object' ||
        Array.isArray(platform_metadata) ||
        platform_metadata.version !== 'INGREDORA_PUBLISHING_TEMPLATE_V1' ||
        !platform_metadata.platforms ||
        typeof platform_metadata.platforms !== 'object' ||
        Array.isArray(platform_metadata.platforms)
      ) {
        return NextResponse.json({ error: 'Los metadatos por plataforma no tienen un formato válido.' }, { status: 400 })
      }

      const metadataSize = new TextEncoder().encode(JSON.stringify(platform_metadata)).byteLength
      if (metadataSize > 256 * 1024) {
        return NextResponse.json({ error: 'Los metadatos superan el límite permitido.' }, { status: 413 })
      }

      normalizedPlatformMetadata = platform_metadata as Record<string, unknown>
    }

    const publicUrl = videoUrl
    
    // Extraer el filePath desde la publicUrl para verificar existencia
    // publicUrl = https://xxx.supabase.co/storage/v1/object/public/videos/userId/filename
    const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
    if (videoUrl.startsWith(supabaseStoragePrefix)) {
      const fullPath = videoUrl.replace(supabaseStoragePrefix, '') // e.g. "videos/userId/filename"
      const pathParts = fullPath.split('/')
      // pathParts[0] = "videos" (bucket), pathParts[1] = userId, pathParts[2] = filename
      const bucket = pathParts[0]
      const folder = pathParts.slice(1, -1).join('/') // e.g. "userId"
      const fileName = pathParts[pathParts.length - 1]

      console.log(`[upload] 🔍 Verificando existencia. bucket: ${bucket}, folder: ${folder}, file: ${fileName}`)

      const { data: list, error: listError } = await supabase.storage
        .from(bucket)
        .list(folder, { search: fileName })

      console.log(`[upload] 📂 Lista de archivos en el bucket (con search):`, list)
      console.log(`[upload] 📂 Error de listado:`, listError)

      if (listError) {
        console.warn(`[upload] ⚠️ No se pudo verificar el archivo (${listError.message}), continuando de todas formas.`)
      } else if (!list || list.length === 0) {
        console.error(`[upload] ❌ El archivo no existe en Storage: ${fullPath}`)
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
        tags: Array.isArray(tags) ? tags : [],
        privacy: privacy || 'Público',
        ...(scheduled_for ? { scheduled_for } : {}),
        ...(normalizedPlatformMetadata ? { platform_metadata: normalizedPlatformMetadata } : {}),
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
