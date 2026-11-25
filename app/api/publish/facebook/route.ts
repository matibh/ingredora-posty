import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToFacebook } from '@/lib/facebook';
import { refreshMetaToken } from '@/lib/meta';
import { getPlatformMetadata, appendMetadataHashtags } from '@/lib/platform-metadata';

export async function POST(request: Request) {
  try {
    const { jobId, clientId } = await request.json();

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

    // 2. Get Facebook Token
    const { data: tokenData, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .eq('platform', 'facebook')
      .maybeSingle();

    if (tokenError || !tokenData) {
      await supabase.from('jobs').update({ status: 'error', error_message: 'Token de Facebook no encontrado' }).eq('id', jobId);
      return NextResponse.json({ error: 'Token de Facebook no encontrado' }, { status: 400 });
    }

    // Verify token expiration and refresh if needed
    let accessToken = tokenData.access_token;
    if (tokenData.expires_at) {
       const expiresAtDate = new Date(tokenData.expires_at);
       if (expiresAtDate < new Date()) {
          await supabase.from('jobs').update({ status: 'error', error_message: 'El token de Facebook ha expirado. Reconectá la cuenta.' }).eq('id', jobId);
          return NextResponse.json({ error: 'El token de Facebook ha expirado' }, { status: 400 });
       }
       
       // Si expira en menos de 7 días, renovarlo
       const daysUntilExpiry = (expiresAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
       if (daysUntilExpiry < 7) {
         try {
           console.log(`[publish/facebook] 🔄 Token de Facebook expira en ${daysUntilExpiry.toFixed(1)} días. Renovando...`);
           const { access_token: new_token, expires_at: new_expires } = await refreshMetaToken(
             accessToken,
             process.env.META_APP_ID!,
             process.env.META_APP_SECRET!
           );
           
           accessToken = new_token;
           await supabase
             .from('social_tokens')
             .update({ access_token: new_token, expires_at: new_expires })
             .eq('id', tokenData.id);
             
           console.log(`[publish/facebook] ✅ Token renovado. Nueva expiración: ${new_expires}`);
         } catch (refreshErr) {
           console.error('[publish/facebook] ❌ Error renovando token:', refreshErr);
           // Si falla la renovación pero el token actual aún sirve, podemos intentar continuar.
           // Pero si queremos ser estrictos o notificar al usuario:
           // await supabase.from('jobs').update({ status: 'error', error_message: 'No se pudo renovar la conexión de Facebook. Reconectá la cuenta.' }).eq('id', jobId);
           // return NextResponse.json({ error: 'Error renovando token de Facebook' }, { status: 400 });
         }
       }
    }

    // Facebook receives its own title and copy; hashtags are appended without duplicates.
    const platformMetadata = getPlatformMetadata(job, 'facebook');
    const finalDescription = appendMetadataHashtags(platformMetadata.description, platformMetadata.hashtags);

    // 3. Upload to Facebook
    const result = await uploadToFacebook(
      accessToken,
      job.video_url,
      platformMetadata.title || '',
      finalDescription,
      tokenData.platform_user_id
    );

    // 4. Update Job on Success
    const updatedStatus = job.scheduled_for ? 'pending' : 'done';
    
    const videoId = result.id;
    const videoUrl = `https://www.facebook.com/watch?v=${videoId}`;
    
    console.log('[publish/facebook] 🆔 Video ID guardado:', videoId);
    console.log('[publish/facebook] 🔗 URL:', videoUrl);

    // Leer platform_video_url existente y combinar con Facebook
    const { data: currentJob } = await supabase.from('jobs').select('platform_video_url').eq('id', jobId).single();
    let existingUrls: Record<string, string> = {};
    if (currentJob?.platform_video_url) {
      try { existingUrls = JSON.parse(currentJob.platform_video_url); } catch {}
    }
    const updatedUrls = { ...existingUrls, facebook: videoUrl };

    await supabase.from('jobs').update({
      status: updatedStatus,
      platform_video_id: videoId, // retrocompatibilidad
      platform_video_url: JSON.stringify(updatedUrls),
      error_message: null
    }).eq('id', jobId);

    return NextResponse.json({ success: true, platform_video_id: videoId, videoUrl });

  } catch (error: unknown) {
    console.error('API Publish Facebook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
