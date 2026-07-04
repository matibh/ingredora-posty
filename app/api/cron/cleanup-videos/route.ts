import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Puede ser GET o POST dependiendo de cómo llame Vercel u otro servicio
export async function GET(request: Request) {
  return handleCron(request)
}

export async function POST(request: Request) {
  return handleCron(request)
}

async function handleCron(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    // Validación de seguridad (Cron Secret)
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[cleanup-videos] Intento de acceso no autorizado')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Buscar todos los jobs:
    // status = 'done', video_deleted = false, created_at < NOW() - 2 horas
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const { data: jobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, video_url')
      .eq('status', 'done')
      .eq('video_deleted', false)
      .lt('created_at', twoHoursAgo)

    if (fetchError) {
      console.error('[cleanup-videos] Error buscando jobs:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      console.log('[cleanup-videos] No hay videos para limpiar.')
      return NextResponse.json({ processed: 0, message: 'No hay videos pendientes de limpieza' })
    }

    console.log(`[cleanup-videos] Encontrados ${jobs.length} jobs para limpiar.`)

    let processed = 0
    const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`

    for (const job of jobs) {
      if (!job.video_url || !job.video_url.startsWith(supabaseStoragePrefix)) {
        console.warn(`[cleanup-videos] Job ${job.id} tiene URL inválida o externa. Saltando.`)
        continue
      }

      const fullPath = job.video_url.replace(supabaseStoragePrefix, '')
      const pathParts = fullPath.split('/')
      const bucket = pathParts[0]
      const filePath = pathParts.slice(1).join('/')

      // Borrar de storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (storageError) {
        console.error(`[cleanup-videos] ❌ Error borrando archivo de job ${job.id}:`, storageError.message)
        continue // Seguimos con el siguiente
      }

      // Actualizar job
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          video_deleted: true,
          video_deleted_at: new Date().toISOString()
        })
        .eq('id', job.id)

      if (updateError) {
        console.error(`[cleanup-videos] ❌ Error actualizando estado de job ${job.id}:`, updateError.message)
      } else {
        processed++
        console.log(`[cleanup-videos] ✅ Job ${job.id} limpiado exitosamente.`)
      }
    }

    return NextResponse.json({ processed, total_found: jobs.length })

  } catch (error) {
    console.error('[cleanup-videos] ❌ Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
