import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Never return OAuth secrets to the browser. The UI only needs to know
    // whether a refresh token exists so it can display expired accounts safely.
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        client_social_accounts (id, client_id, platform, username, page_name, created_at),
        social_tokens (id, client_id, user_id, platform, username, page_name, refresh_token, expires_at, created_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API Clients GET] Error fetching clients:', error.message)
      return NextResponse.json({ error: 'No se pudieron obtener los clientes' }, { status: 500 })
    }

    const sanitizedClients = (clients ?? []).map((client) => ({
      ...client,
      social_tokens: (client.social_tokens ?? [])
        .filter((token: { client_id: string }) => token.client_id === client.id)
        .map((token: { refresh_token: string | null; [key: string]: unknown }) => {
          const { refresh_token, ...safeToken } = token
          return {
            ...safeToken,
            has_refresh_token: Boolean(refresh_token),
          }
        }),
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
