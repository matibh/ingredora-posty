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

    // 3. Ocultar el job en la base de datos
    const { error: hideError } = await supabase
      .from('jobs')
      .update({ hidden: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (hideError) {
      console.error(`[hide-job] ❌ Error ocultando job: ${hideError.message}`)
      return NextResponse.json({ error: 'Error al ocultar el trabajo' }, { status: 500 })
    }

    console.log(`[hide-job] ✅ Job ${id} ocultado exitosamente.`)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[hide-job] ❌ Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
