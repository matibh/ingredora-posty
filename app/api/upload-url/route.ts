import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const supabaseUser = await createClient()
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Parse request body
    const { fileName, fileType } = await request.json()
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Falta fileName o fileType' }, { status: 400 })
    }

    // 3. Create Supabase admin client to bypass RLS for creating signed URL if necessary
    // If your bucket allows authenticated users to upload, the normal client might work,
    // but the instruction specifically asked to use service_role.
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Generate unique file path
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueFileName = `${Date.now()}_${sanitizedName}`
    const filePath = `videos/${user.id}/${uniqueFileName}`

    // 5. Create Presigned URL (120 segundos de expiración)
    const { data, error } = await supabaseAdmin.storage
      .from('videos')
      .createSignedUploadUrl(filePath, { expiresIn: 120 })

    if (error || !data?.signedUrl) {
      console.error('[upload-url] Error creating signed URL:', error)
      return NextResponse.json({ error: 'Error al generar URL de subida' }, { status: 500 })
    }

    console.log('[upload-url] ✅ URL prefirmada generada:', filePath)
    
    // We also need the token if supabase requires it or just the signedUrl
    // createSignedUploadUrl returns { signedUrl, path, token }
    return NextResponse.json({
      uploadUrl: data.signedUrl,
      filePath: filePath
    }, { status: 200 })

  } catch (error) {
    console.error('[upload-url] Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
