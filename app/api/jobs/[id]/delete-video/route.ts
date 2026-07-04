import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    // 1. Autenticar usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Falta ID del trabajo' }, { status: 400 })
    }

    // 2. Obtener el job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    // 3. Validar estado
    if (job.status !== 'done') {
      return NextResponse.json({ error: 'El trabajo aún no ha terminado' }, { status: 400 })
    }

    if (job.video_deleted) {
      return NextResponse.json({ error: 'El video ya fue eliminado' }, { status: 400 })
    }

    // 4. Borrar archivo de Storage
    const videoUrl = job.video_url
    if (videoUrl) {
      const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
      if (videoUrl.startsWith(supabaseStoragePrefix)) {
        const fullPath = videoUrl.replace(supabaseStoragePrefix, '')
        const pathParts = fullPath.split('/')
        const bucket = pathParts[0]
        const filePath = pathParts.slice(1).join('/')

        console.log(`[delete-video] 🗑️ Borrando de bucket: ${bucket}, path: ${filePath}`)

        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([filePath])

        if (storageError) {
          console.error(`[delete-video] ❌ Error borrando archivo: ${storageError.message}`)
          return NextResponse.json({ error: `Error borrando archivo: ${storageError.message}` }, { status: 500 })
        }
      }
    }

    // 5. Marcar como borrado en DB
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        video_deleted: true,
        video_deleted_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error(`[delete-video] ❌ Error actualizando job: ${updateError.message}`)
      return NextResponse.json({ error: 'Video borrado pero error al actualizar estado' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[delete-video] ❌ Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
