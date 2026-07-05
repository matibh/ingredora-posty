import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToFacebook } from '@/lib/facebook';

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

    // 2. Get Facebook Token
    const { data: tokenData, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('client_id', clientId)
      .eq('platform', 'facebook')
      .maybeSingle();

    if (tokenError || !tokenData) {
      await supabase.from('jobs').update({ status: 'error', error_message: 'Token de Facebook no encontrado' }).eq('id', jobId);
      return NextResponse.json({ error: 'Token de Facebook no encontrado' }, { status: 400 });
    }

    // Verify token expiration loosely
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
       await supabase.from('jobs').update({ status: 'error', error_message: 'El token de Facebook ha expirado' }).eq('id', jobId);
       return NextResponse.json({ error: 'El token de Facebook ha expirado' }, { status: 400 });
    }

    // Format title and description (combine tags if needed, or put them in description)
    const tagsString = job.tags && job.tags.length > 0 ? '\n\n' + job.tags.map((t: string) => `#${t.replace('#', '')}`).join(' ') : '';
    const finalDescription = `${job.description || ''}${tagsString}`;

    // 3. Upload to Facebook
    let scheduledDate: Date | undefined = undefined;
    if (job.scheduled_for) {
      scheduledDate = new Date(job.scheduled_for);
    }

    const result = await uploadToFacebook(
      tokenData.access_token,
      job.video_url,
      job.title || '',
      finalDescription,
      tokenData.platform_user_id,
      scheduledDate
    );

    // 4. Update Job on Success
    const updatedStatus = job.scheduled_for ? 'pending' : 'done';
    
    await supabase.from('jobs').update({
      status: updatedStatus,
      platform_video_id: result.id,
      error_message: null
    }).eq('id', jobId);

    return NextResponse.json({ success: true, platform_video_id: result.id });

  } catch (error: any) {
    console.error('API Publish Facebook error:', error);
    
    if (error.message && error.message.includes('id')) {
        // Attempt to update the job with the error
        try {
            const supabase = await createClient();
            // It might fail if we can't extract jobId safely
        } catch(e) {}
    }

    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
