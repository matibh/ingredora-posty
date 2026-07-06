const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 5000;

async function waitForContainerReady(
  creationId: string,
  accessToken: string,
  threadsUserId: string
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusUrl = `https://graph.threads.net/v1.0/${creationId}?fields=status_code,status,id&access_token=${accessToken}`;

    console.log(`[threads/poll] ⏳ Intento ${attempt}/${MAX_POLL_ATTEMPTS} — consultando estado del contenedor ${creationId}`);

    const statusResponse = await fetch(statusUrl);
    console.log(`[threads/poll] 📊 Status HTTP: ${statusResponse.status}`);

    const statusData = await statusResponse.json();
    console.log(`[threads/poll] 📊 Body:`, JSON.stringify(statusData, null, 2));

    if (statusData.error) {
      throw new Error(`Error consultando estado del contenedor: ${statusData.error.message}`);
    }

    const statusCode = statusData.status_code;

    // Si no viene status_code pero sí viene un id, asumimos que ya está FINISHED
    if (!statusCode) {
      if (statusData.id) {
        console.log(`[threads/poll] ⚠️ No se encontró status_code, pero hay id (${statusData.id}) — asumiendo FINISHED`);
        return;
      }
      console.log(`[threads/poll] ⚠️ Respuesta sin status_code ni id, esperando siguiente intento...`);
      continue;
    }

    if (statusCode === 'FINISHED') {
      console.log('[threads/poll] ✅ Contenedor listo para publicar');
      return;
    }

    if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
      throw new Error(`Procesamiento del video falló. Estado de Threads: ${statusCode}. Detalle: ${statusData.status || 'desconocido'}`);
    }

    // IN_PROGRESS u otros: seguir esperando
    console.log(`[threads/poll] ⏳ Estado: ${statusCode}, esperando...`);
  }

  throw new Error(`El video no terminó de procesarse después de ${MAX_POLL_ATTEMPTS} intentos. Intenta con un video más corto.`);
}

export async function uploadToThreads(
  accessToken: string,
  videoUrl: string,
  text: string,
  threadsUserId: string
): Promise<{ id: string }> {
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
    console.log('[threads/upload] 📦 Creando contenedor en:', containerUrl);
    console.log('[threads/upload] 📦 Body:', JSON.stringify({ media_type: 'VIDEO', video_url: videoUrl, text: text }));
    const createResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: createBody.toString(),
    });

    const createData = await createResponse.json();
    console.log('[threads/upload] 📦 Respuesta creación contenedor:', JSON.stringify(createData));

    if (createData.error) {
      throw new Error(`Error al crear contenedor Threads: ${createData.error.message || JSON.stringify(createData.error)}`);
    }

    const creationId = createData.id;
    if (!creationId) {
      throw new Error('Threads no devolvió un creation_id');
    }

    console.log('[threads/upload] ✅ Contenedor creado. ID:', creationId);

    // Paso 2: Esperar a que procese el video
    console.log('[threads/upload] ⏳ Esperando procesamiento del video...');
    await waitForContainerReady(creationId, accessToken, threadsUserId);

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
    return { id: publishData.id };
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
