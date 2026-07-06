const MAX_POLL_ATTEMPTS = 10;  // 10 intentos × 5s = 50 segundos máx
const POLL_INTERVAL_MS = 5000;

async function waitForContainerReady(
  creationId: string,
  accessToken: string,
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    // Threads usa 'status' (no 'status_code' — ese es de Instagram)
    const statusUrl = `https://graph.threads.net/v1.0/${creationId}?fields=id,status,error_message`;

    console.log(`[threads/poll] ⏳ Intento ${attempt}/${MAX_POLL_ATTEMPTS} — URL: ${statusUrl}`);

    const statusResponse = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log(`[threads/poll] 📊 HTTP status: ${statusResponse.status}`);

    const statusData = await statusResponse.json();
    console.log(`[threads/poll] 📊 Respuesta completa:`, JSON.stringify(statusData, null, 2));
    console.log(`[threads/poll] 📊 status:`, statusData?.status);
    console.log(`[threads/poll] 📊 error_message:`, statusData?.error_message);
    console.log(`[threads/poll] 📊 id presente:`, !!statusData?.id);

    if (statusData.error) {
      throw new Error(`Error consultando estado del contenedor: ${statusData.error.message}`);
    }

    const status = statusData?.status;

    if (status === 'FINISHED') {
      console.log('[threads/poll] ✅ Contenedor listo para publicar');
      return;
    }

    if (status === 'PUBLISHED') {
      // Caso raro: ya fue publicado directamente
      console.log('[threads/poll] ✅ Contenedor ya publicado directamente');
      return;
    }

    if (status === 'ERROR') {
      throw new Error(`Error en el contenedor de Threads: ${statusData?.error_message || 'Error desconocido'}`);
    }

    if (status === 'EXPIRED') {
      throw new Error('El contenedor expiró (24 horas sin publicar). Crea un nuevo video e inténtalo de nuevo.');
    }

    if (!status) {
      // Sin campo status — si hay id, asumimos FINISHED
      if (statusData?.id) {
        console.log(`[threads/poll] ⚠️ Sin campo 'status' pero hay id (${statusData.id}) — asumiendo FINISHED`);
        return;
      }
      console.log(`[threads/poll] ⚠️ Sin campo 'status' ni 'id', esperando siguiente intento...`);
      continue;
    }

    // IN_PROGRESS u otros estados desconocidos → seguir esperando
    console.log(`[threads/poll] ⏳ Estado: ${status}, esperando...`);
  }

  throw new Error(`Timeout: el video no terminó de procesarse después de ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s. Intenta con un video más corto.`);
}


export async function uploadToThreads(
  accessToken: string,
  videoUrl: string,
  text: string,
  threadsUserId: string
): Promise<{ id: string; permalink: string }> {
  console.log('[threads/upload] 🚀 Iniciando publicación en Threads');
  console.log('[threads/upload] 📹 Video URL:', videoUrl);
  console.log('[threads/upload] 👤 Threads User ID:', threadsUserId);

  try {
    // Paso 1: Crear contenedor de media
    const createBody = new URLSearchParams({
      access_token: accessToken,
      media_type: 'VIDEO',
      video_url: videoUrl,
      text: text,
    });

    const containerUrl = `https://graph.threads.net/v1.0/${threadsUserId}/threads`;
    console.log('[threads/upload] 🔑 Access token (primeros 20 chars):', accessToken?.substring(0, 20));
    console.log('[threads/upload] 📦 Creando contenedor en:', containerUrl);
    console.log('[threads/upload] 📦 Body:', JSON.stringify({ media_type: 'VIDEO', video_url: videoUrl, text: text }));
    const createResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: createBody.toString(),
    });

    const createData = await createResponse.json();
    console.log('[threads/upload] 📦 HTTP status:', createResponse.status);
    console.log('[threads/upload] 📦 Respuesta completa:', JSON.stringify(createData, null, 2));
    console.log('[threads/upload] 📦 Headers:', JSON.stringify(Object.fromEntries(createResponse.headers.entries()), null, 2));

    if (createData.error) {
      const errDetail = createData.error.error_user_msg || createData.error.message || JSON.stringify(createData.error);
      throw new Error(`Error al crear contenedor Threads: ${errDetail}`);
    }

    const creationId = createData.id;
    if (!creationId) {
      throw new Error('Threads no devolvió un creation_id');
    }

    console.log('[threads/upload] ✅ Contenedor creado. ID:', creationId);

    // Paso 2: Esperar a que procese el video
    console.log('[threads/upload] ⏳ Esperando procesamiento del video...');
    await waitForContainerReady(creationId, accessToken);

    // Paso 3: Publicar el contenedor
    const publishBody = new URLSearchParams({
      access_token: accessToken,
      creation_id: creationId,
    });

    const publishUrl = `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`;
    console.log('[threads/upload] 🚀 Publicando contenedor en:', publishUrl);
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishBody.toString(),
    });

    const publishData = await publishResponse.json();
    console.log('[threads/upload] 📤 Respuesta publicación:', JSON.stringify(publishData));

    if (publishData.error) {
      throw new Error(`Error al publicar Thread: ${publishData.error.message || JSON.stringify(publishData.error)}`);
    }

    if (!publishData.id) {
      throw new Error('Threads no devolvió el ID de la publicación');
    }

    console.log('[threads/upload] 🎉 Publicado exitosamente. ID:', publishData.id);

    // Paso 4: Obtener permalink real (contiene el shortcode para la URL pública)
    let permalink = `https://www.threads.com/t/${publishData.id}`; // fallback
    try {
      const permalinkRes = await fetch(
        `https://graph.threads.net/v1.0/${publishData.id}?fields=id,permalink,shortcode,username`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const permalinkData = await permalinkRes.json();
      console.log('[threads/upload] 🔗 Datos de permalink:', JSON.stringify(permalinkData));

      if (permalinkData.permalink) {
        permalink = permalinkData.permalink;
      } else if (permalinkData.shortcode && permalinkData.username) {
        permalink = `https://www.threads.com/@${permalinkData.username}/post/${permalinkData.shortcode}`;
      } else if (permalinkData.shortcode) {
        permalink = `https://www.threads.com/t/${permalinkData.shortcode}`;
      }
    } catch (err) {
      console.error('[threads/upload] ⚠️ No se pudo obtener el permalink, usando fallback:', err);
    }

    console.log('[threads/upload] 🔗 Permalink final:', permalink);
    return { id: publishData.id, permalink };
  } catch (error: any) {
    console.error('[threads/upload] ❌ Error en uploadToThreads:', error.message);
    throw error;
  }
}

export async function refreshThreadsToken(
  accessToken: string
): Promise<{ access_token: string; expires_at: string }> {
  // Según documentación de Meta para Threads:
  const url = new URL('https://graph.threads.net/refresh_access_token');
  url.searchParams.append('grant_type', 'ig_refresh_token');
  url.searchParams.append('access_token', accessToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  if (!data.access_token) {
    throw new Error('Meta no devolvió un access token durante la renovación de Threads');
  }

  const expiresInSeconds = data.expires_in || 5184000;
  const newExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  return { access_token: data.access_token, expires_at: newExpiresAt };
}
