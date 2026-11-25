import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToThreads, refreshThreadsToken } from '@/lib/threads';
import { getPlatformMetadata, formatSocialCaption } from '@/lib/platform-metadata';

export async function POST(request: Request) {
  let jobId: string | undefined;

  try {
    const body = await request.json();
    jobId = body.jobId;
    const clientId = body.clientId;

    if (!jobId || !clientId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    
    // 1. Get Job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
    }

    if (job.status !== 'publishing' && job.status !== 'pending' && job.status !== 'scheduled') {
      return NextResponse.json({ error: 'El job ya no está en estado publicable' }, { status: 400 });
    }

    // Update to publishing
    await supabase.from('jobs').update({ status: 'publishing' }).eq('id', jobId);

    // 2. Get Threads Token
    const { data: tokenData, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .eq('platform', 'threads')
      .maybeSingle();

    if (tokenError || !tokenData) {
      await supabase.from('jobs').update({ status: 'error', error_message: 'Token de Threads no encontrado' }).eq('id', jobId);
      return NextResponse.json({ error: 'Token de Threads no encontrado' }, { status: 400 });
    }

    // Verify token expiration and refresh if needed
    let accessToken = tokenData.access_token;
    if (tokenData.expires_at) {
       const expiresAtDate = new Date(tokenData.expires_at);
       if (expiresAtDate < new Date()) {
          await supabase.from('jobs').update({ status: 'error', error_message: 'El token de Threads ha expirado. Reconectá la cuenta.' }).eq('id', jobId);
          return NextResponse.json({ error: 'El token de Threads ha expirado' }, { status: 400 });
       }
       
       // Si expira en menos de 7 días, renovarlo
       const daysUntilExpiry = (expiresAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
       if (daysUntilExpiry < 7) {
         try {
           console.log(`[publish/threads] 🔄 Token de Threads expira en ${daysUntilExpiry.toFixed(1)} días. Renovando...`);
           const { access_token: new_token, expires_at: new_expires } = await refreshThreadsToken(accessToken);
           
           accessToken = new_token;
           await supabase
             .from('social_tokens')
             .update({ access_token: new_token, expires_at: new_expires })
             .eq('id', tokenData.id);
             
           console.log(`[publish/threads] ✅ Token renovado. Nueva expiración: ${new_expires}`);
         } catch (refreshErr) {
           console.error('[publish/threads] ❌ Error renovando token:', refreshErr);
         }
       }
    }

    // Resolve Threads' own title, copy and hashtags (or legacy global fields).
    const platformMetadata = getPlatformMetadata(job, 'threads');
    const finalText = formatSocialCaption(platformMetadata);

    console.log('[publish/threads] 📤 Publicando en Threads...');
    console.log('[publish/threads] 📹 Video URL:', job.video_url);

    // 3. Upload to Threads
    const result = await uploadToThreads(
      accessToken,
      job.video_url,
      finalText,
      tokenData.platform_user_id,
      platformMetadata.altText,
    );

    // 4. Update Job on Success
    const videoId = result.id;
    // Usar el permalink real (contiene el shortcode como Dac_JhgggS6)
    const videoUrl = result.permalink || `https://www.threads.com/t/${videoId}`;

    console.log('[publish/threads] ✅ Publicación exitosa. ID:', videoId);
    console.log('[publish/threads] 🔗 URL:', videoUrl);

    // Leer platform_video_url existente y combinar con Threads
    const { data: currentJob } = await supabase.from('jobs').select('platform_video_url').eq('id', jobId).single();
    let existingUrls: Record<string, string> = {};
    if (currentJob?.platform_video_url) {
      try { existingUrls = JSON.parse(currentJob.platform_video_url); } catch {}
    }
    const updatedUrls = { ...existingUrls, threads: videoUrl };

    await supabase.from('jobs').update({
      status: 'done',
      platform_video_id: videoId,
      platform_video_url: JSON.stringify(updatedUrls),
      error_message: null
    }).eq('id', jobId);

    return NextResponse.json({ success: true, platform_video_id: videoId, videoUrl });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al publicar en Threads';
    console.error('[publish/threads] ❌ Error:', errorMessage);

    if (jobId) {
      try {
        const supabase = await createClient();
        await supabase.from('jobs').update({
          status: 'error',
          error_message: errorMessage
        }).eq('id', jobId);
      } catch (dbErr) {
        console.error('[publish/threads] ❌ No se pudo actualizar el job a error:', dbErr);
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
