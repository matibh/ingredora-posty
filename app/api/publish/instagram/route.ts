import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToInstagram } from '@/lib/instagram';
import { refreshMetaToken } from '@/lib/meta';
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

    console.log('[publish/instagram] 🚀 Iniciando publicación. jobId:', jobId, 'clientId:', clientId);

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

    // 2. Get Instagram Token
    const { data: tokenData, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
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

    // Verify token expiration and refresh if needed
    let accessToken = tokenData.access_token;
    if (tokenData.expires_at) {
       const expiresAtDate = new Date(tokenData.expires_at);
       if (expiresAtDate < new Date()) {
          await supabase.from('jobs').update({ status: 'error', error_message: 'El token de Instagram ha expirado. Reconectá la cuenta.' }).eq('id', jobId);
          return NextResponse.json({ error: 'El token de Instagram ha expirado' }, { status: 400 });
       }
       
       // Si expira en menos de 7 días, renovarlo
       const daysUntilExpiry = (expiresAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
       if (daysUntilExpiry < 7) {
         try {
           console.log(`[publish/instagram] 🔄 Token de Instagram expira en ${daysUntilExpiry.toFixed(1)} días. Renovando...`);
           const { access_token: new_token, expires_at: new_expires } = await refreshMetaToken(
             accessToken,
             process.env.INSTAGRAM_APP_ID!,
             process.env.INSTAGRAM_APP_SECRET!
           );
           
           accessToken = new_token;
           await supabase
             .from('social_tokens')
             .update({ access_token: new_token, expires_at: new_expires })
             .eq('id', tokenData.id);
             
           console.log(`[publish/instagram] ✅ Token renovado. Nueva expiración: ${new_expires}`);
         } catch (refreshErr) {
           console.error('[publish/instagram] ❌ Error renovando token:', refreshErr);
         }
       }
    }

    // Resolve this platform's copy; legacy jobs retain their previous caption format.
    const platformMetadata = getPlatformMetadata(job, 'instagram');
    const finalCaption = formatSocialCaption(platformMetadata);

    console.log('[publish/instagram] 📹 Video URL:', job.video_url);
    console.log('[publish/instagram] 📝 Caption length:', finalCaption.length);

    // 3. Upload to Instagram (includes polling for container readiness)
    const result = await uploadToInstagram(
      accessToken,
      job.video_url,
      finalCaption,
      tokenData.platform_user_id,
      platformMetadata.altText,
    );

    // 4. Update Job on Success
    const videoId = result.id;
    // La firma de uploadToInstagram la acabamos de actualizar para devolver permalink
    const videoUrl = result.permalink || `https://www.instagram.com/p/${videoId}`;

    console.log('[publish/instagram] 🆔 Video ID guardado:', videoId);
    console.log('[publish/instagram] 🔗 URL:', videoUrl);

    // Leer platform_video_url existente y combinar con Instagram
    const { data: currentJob } = await supabase.from('jobs').select('platform_video_url').eq('id', jobId).single();
    let existingUrls: Record<string, string> = {};
    if (currentJob?.platform_video_url) {
      try { existingUrls = JSON.parse(currentJob.platform_video_url); } catch {}
    }
    const updatedUrls = { ...existingUrls, instagram: videoUrl };

    await supabase.from('jobs').update({
      status: 'done',
      platform_video_id: videoId, // retrocompatibilidad
      platform_video_url: JSON.stringify(updatedUrls),
      error_message: null
    }).eq('id', jobId);

    console.log('[publish/instagram] ✅ Job actualizado a done. platform_video_id:', videoId);
    return NextResponse.json({ success: true, platform_video_id: videoId, videoUrl });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al publicar en Instagram';
    console.error('[publish/instagram] ❌ Error:', errorMessage);

    // Update job status to error
    if (jobId) {
      try {
        const supabase = await createClient();
        await supabase.from('jobs').update({
          status: 'error',
          error_message: errorMessage
        }).eq('id', jobId);
      } catch (dbErr) {
        console.error('[publish/instagram] ❌ No se pudo actualizar el job a error:', dbErr);
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
