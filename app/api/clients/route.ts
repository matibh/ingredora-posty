import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener los clientes con sus cuentas sociales asociadas
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        client_social_accounts (*),
        social_tokens (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API Clients GET] Error fetching clients:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Asegurar que social_tokens solo incluya los del cliente (por si Supabase hizo el JOIN por user_id en vez de client_id)
    const sanitizedClients = clients.map((client: any) => ({
      ...client,
      social_tokens: client.social_tokens ? client.social_tokens.filter((t: any) => t.client_id === client.id) : []
    }))

    return NextResponse.json(sanitizedClients, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  } catch (error: unknown) {
    console.error('[API Clients GET] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || !body.name) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 })
    }

    const { name, logo_url } = body

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name,
        logo_url: logo_url || null
      })
      .select()
      .single()

    if (error) {
      console.error('[API Clients POST] Error creating client:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(client, { status: 201 })
  } catch (error: unknown) {
    console.error('[API Clients POST] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
