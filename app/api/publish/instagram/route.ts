import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToInstagram } from '@/lib/instagram';

export async function POST(request: Request) {
  try {
    const { jobId, clientId } = await request.json();

    if (!jobId || !clientId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

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

    if (tokenError || !tokenData) {
      await supabase.from('jobs').update({ status: 'error', error_message: 'Token de Instagram no encontrado' }).eq('id', jobId);
      return NextResponse.json({ error: 'Token de Instagram no encontrado' }, { status: 400 });
    }

    // Verify token expiration loosely
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
       await supabase.from('jobs').update({ status: 'error', error_message: 'El token de Instagram ha expirado' }).eq('id', jobId);
       return NextResponse.json({ error: 'El token de Instagram ha expirado' }, { status: 400 });
    }

    // Format caption (Instagram uses caption instead of title + description)
    const titleString = job.title ? `${job.title}\n\n` : '';
    const tagsString = job.tags && job.tags.length > 0 ? '\n\n' + job.tags.map((t: string) => `#${t.replace('#', '')}`).join(' ') : '';
    const finalCaption = `${titleString}${job.description || ''}${tagsString}`;

    // Note: Instagram doesn't natively support scheduling via Graph API in the same way FB does. 
    // It's possible to pass `is_carousel_item` etc, but natively scheduling Reels might not be fully supported.
    // If the job is scheduled, Posty's backend cron should actually just wait until the right time to trigger this API.
    // The user's prompt did not specify Instagram scheduling via API (unlike FB `scheduled_publish_time`).

    // 3. Upload to Instagram
    const result = await uploadToInstagram(
      tokenData.access_token,
      job.video_url,
      finalCaption,
      tokenData.platform_user_id
    );

    // 4. Update Job on Success
    await supabase.from('jobs').update({
      status: 'done', // Since IG is published immediately when called
      platform_video_id: result.id,
      error_message: null
    }).eq('id', jobId);

    return NextResponse.json({ success: true, platform_video_id: result.id });

  } catch (error: any) {
    console.error('API Publish Instagram error:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
