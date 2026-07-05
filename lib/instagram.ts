const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 5000; // 5 segundos entre intentos (máx ~100 segundos total)

async function waitForContainerReady(
  creationId: string,
  accessToken: string,
  igUserId: string
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    // Esperar antes de consultar (la primera vez también, para darle tiempo inicial)
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusUrl = new URL(`https://graph.instagram.com/v22.0/${creationId}`);
    statusUrl.searchParams.append('fields', 'status_code,status');
    statusUrl.searchParams.append('access_token', accessToken);

    const statusResponse = await fetch(statusUrl.toString());
    const statusData = await statusResponse.json();

    console.log(`[instagram] 🔄 Intento ${attempt}/${MAX_POLL_ATTEMPTS} estado contenedor:`, JSON.stringify(statusData));

    if (statusData.error) {
      throw new Error(`Error consultando estado del contenedor: ${statusData.error.message}`);
    }

    const statusCode = statusData.status_code;

    if (statusCode === 'FINISHED') {
      console.log('[instagram] ✅ Contenedor listo para publicar');
      return;
    }

    if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
      throw new Error(`Procesamiento del video falló. Estado de Instagram: ${statusCode}. Detalle: ${statusData.status || 'desconocido'}`);
    }

    // Continúa esperando si está IN_PROGRESS o PUBLISHED
    console.log(`[instagram] ⏳ Estado: ${statusCode}, esperando...`);
  }

  throw new Error(`El video no terminó de procesarse después de ${MAX_POLL_ATTEMPTS} intentos (${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s). Intenta con un video más corto.`);
}

export async function uploadToInstagram(
  accessToken: string,
  videoUrl: string,
  caption: string,
  igUserId: string
): Promise<{ id: string }> {
  console.log('[instagram] 🚀 Iniciando publicación en Instagram');
  console.log('[instagram] 📹 Video URL:', videoUrl);
  console.log('[instagram] 👤 IG User ID:', igUserId);

  try {
    // Paso 1: Crear contenedor de media (Reels)
    const createBody = new URLSearchParams({
      access_token: accessToken,
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption,
      share_to_feed: 'true',
    });

    console.log('[instagram] 📦 Creando contenedor de media...');
    const createResponse = await fetch(`https://graph.instagram.com/v22.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: createBody.toString(),
    });

    const createData = await createResponse.json();

    console.log('[instagram] 📦 Respuesta creación contenedor:', JSON.stringify(createData));

    if (createData.error) {
      throw new Error(`Error al crear contenedor IG: ${createData.error.message || JSON.stringify(createData.error)}`);
    }

    const creationId = createData.id;
    if (!creationId) {
      throw new Error('Instagram no devolvió un creation_id');
    }

    console.log('[instagram] ✅ Contenedor creado. ID:', creationId);

    // Paso 2: Esperar a que Instagram procese el video (polling con timeout)
    console.log('[instagram] ⏳ Esperando procesamiento del video...');
    await waitForContainerReady(creationId, accessToken, igUserId);

    // Paso 3: Publicar el contenedor
    const publishBody = new URLSearchParams({
      access_token: accessToken,
      creation_id: creationId,
    });

    console.log('[instagram] 🚀 Publicando contenedor...');
    const publishResponse = await fetch(`https://graph.instagram.com/v22.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishBody.toString(),
    });

    const publishData = await publishResponse.json();

    console.log('[instagram] 📤 Respuesta publicación:', JSON.stringify(publishData));

    if (publishData.error) {
      throw new Error(`Error al publicar Reel IG: ${publishData.error.message || JSON.stringify(publishData.error)}`);
    }

    if (!publishData.id) {
      throw new Error('Instagram no devolvió el ID de la publicación');
    }

    console.log('[instagram] 🎉 Publicado exitosamente. ID:', publishData.id);
    return { id: publishData.id };
  } catch (error: any) {
    console.error('[instagram] ❌ Error en uploadToInstagram:', error.message);
    throw error;
  }
}
