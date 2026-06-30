import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string; accountId: string }> | { id: string; accountId: string }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id: client_id, accountId } = resolvedParams

    // Validar que el cliente pertenece al usuario
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .eq('user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado o sin acceso' }, { status: 404 })
    }

    // Eliminar la cuenta asociada
    const { error: deleteError } = await supabase
      .from('client_social_accounts')
      .delete()
      .eq('id', accountId)
      .eq('client_id', client_id)

    if (deleteError) {
      console.error('[API Client Account DELETE] Error deleting account:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[API Client Account DELETE] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
