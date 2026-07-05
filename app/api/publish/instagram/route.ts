import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToInstagram } from '@/lib/instagram';

export async function POST(request: Request) {
  let jobId: string | undefined;

  try {
    const body = await request.json();
    jobId = body.jobId;
    const clientId = body.clientId;

    if (!jobId || !clientId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    console.log('[publish/instagram] 🚀 Iniciando publicación. jobId:', jobId, 'clientId:', clientId);

    const supabase = await createClient();
    
    // 1. Get Job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
    }

    if (job.status !== 'publishing' && job.status !== 'pending' && job.status !== 'scheduled') {
      return NextResponse.json({ error: 'El job ya no está en estado publicable' }, { status: 400 });
    }

    // Update to publishing
    await supabase.from('jobs').update({ status: 'publishing' }).eq('id', jobId);

    // 2. Get Instagram Token
    const { data: tokenData, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('client_id', clientId)
      .eq('platform', 'instagram')
      .maybeSingle();

    console.log('[publish/instagram] 🔑 Token encontrado:', tokenData ? 'sí' : 'no');
    console.log('[publish/instagram] 👤 platform_user_id:', tokenData?.platform_user_id);
    console.log('[publish/instagram] 📅 expires_at:', tokenData?.expires_at);

    if (tokenError || !tokenData) {
      await supabase.from('jobs').update({ status: 'error', error_message: 'Token de Instagram no encontrado' }).eq('id', jobId);
      return NextResponse.json({ error: 'Token de Instagram no encontrado' }, { status: 400 });
    }

    // Verify token expiration loosely
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
       await supabase.from('jobs').update({ status: 'error', error_message: 'El token de Instagram ha expirado. Reconectá la cuenta.' }).eq('id', jobId);
       return NextResponse.json({ error: 'El token de Instagram ha expirado' }, { status: 400 });
    }

    // Format caption
    const titleString = job.title ? `${job.title}\n\n` : '';
    const tagsString = job.tags && job.tags.length > 0 ? '\n\n' + job.tags.map((t: string) => `#${t.replace(/^#/, '')}`).join(' ') : '';
    const finalCaption = `${titleString}${job.description || ''}${tagsString}`.trim();

    console.log('[publish/instagram] 📹 Video URL:', job.video_url);
    console.log('[publish/instagram] 📝 Caption length:', finalCaption.length);

    // 3. Upload to Instagram (includes polling for container readiness)
    const result = await uploadToInstagram(
      tokenData.access_token,
      job.video_url,
      finalCaption,
      tokenData.platform_user_id
    );

    // 4. Update Job on Success
    await supabase.from('jobs').update({
      status: 'done',
      platform_video_id: result.id,
      error_message: null
    }).eq('id', jobId);

    console.log('[publish/instagram] ✅ Job actualizado a done. platform_video_id:', result.id);
    return NextResponse.json({ success: true, platform_video_id: result.id });

  } catch (error: any) {
    console.error('[publish/instagram] ❌ Error:', error.message);

    // Update job status to error
    if (jobId) {
      try {
        const supabase = await createClient();
        await supabase.from('jobs').update({
          status: 'error',
          error_message: error.message || 'Error desconocido al publicar en Instagram'
        }).eq('id', jobId);
      } catch (dbErr) {
        console.error('[publish/instagram] ❌ No se pudo actualizar el job a error:', dbErr);
      }
    }

    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
