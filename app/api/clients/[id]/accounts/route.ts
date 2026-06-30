import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }> | { id: string }
}

export async function POST(
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
    const client_id = resolvedParams.id

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

    const body = await request.json().catch(() => null)
    if (!body || !body.platform || !body.username) {
      return NextResponse.json({ error: 'La plataforma y el nombre de usuario son obligatorios' }, { status: 400 })
    }

    const { platform, username, page_name, social_token_id } = body

    const { data: account, error: accountError } = await supabase
      .from('client_social_accounts')
      .insert({
        client_id,
        social_token_id: social_token_id || null,
        platform,
        username,
        page_name: page_name || null
      })
      .select()
      .single()

    if (accountError) {
      console.error('[API Client Accounts POST] Error creating account:', accountError)
      return NextResponse.json({ error: accountError.message }, { status: 500 })
    }

    return NextResponse.json(account, { status: 201 })
  } catch (error: unknown) {
    console.error('[API Client Accounts POST] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
