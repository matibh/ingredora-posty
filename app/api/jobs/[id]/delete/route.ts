import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // 2. Obtener el job (solo si pertenece al usuario)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    // 3. Validar estado — no se puede eliminar si está en proceso de publicación
    if (job.status === 'publishing') {
      return NextResponse.json(
        { error: 'No se puede eliminar un trabajo que está siendo publicado.' },
        { status: 400 }
      )
    }

    // 4. Borrar video de Storage si existe y no fue borrado previamente
    if (!job.video_deleted && job.video_url) {
      const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
      if (job.video_url.startsWith(supabaseStoragePrefix)) {
        const fullPath = job.video_url.replace(supabaseStoragePrefix, '')
        const pathParts = fullPath.split('/')
        const bucket = pathParts[0]
        const filePath = pathParts.slice(1).join('/')

        console.log(`[delete-job] 🗑️ Borrando video de bucket: ${bucket}, path: ${filePath}`)

        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([filePath])

        if (storageError) {
          console.warn(`[delete-job] ⚠️ Error borrando archivo de Storage: ${storageError.message}`)
          // No bloquear la eliminación del job por un error de Storage
        }
      }
    }

    // 5. Eliminar el job de la base de datos
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error(`[delete-job] ❌ Error eliminando job: ${deleteError.message}`)
      return NextResponse.json({ error: 'Error al eliminar el trabajo' }, { status: 500 })
    }

    console.log(`[delete-job] ✅ Job ${id} eliminado exitosamente.`)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[delete-job] ❌ Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
