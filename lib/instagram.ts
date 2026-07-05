export async function uploadToInstagram(
  accessToken: string,
  videoUrl: string,
  caption: string,
  igUserId: string
): Promise<{ id: string }> {
  try {
    // Paso 1: Crear contenedor de media (Reels)
    const createUrl = new URL(`https://graph.instagram.com/v22.0/${igUserId}/media`);
    createUrl.searchParams.append('access_token', accessToken);
    createUrl.searchParams.append('media_type', 'REELS');
    createUrl.searchParams.append('video_url', videoUrl);
    createUrl.searchParams.append('caption', caption);

    const createResponse = await fetch(createUrl.toString(), {
      method: 'POST',
    });

    const createData = await createResponse.json();

    if (createData.error) {
      console.error('Instagram create media error:', createData.error);
      throw new Error(`Error al crear Reels IG: ${createData.error.message || JSON.stringify(createData.error)}`);
    }

    const creationId = createData.id;
    if (!creationId) {
      throw new Error('Instagram no devolvió un creation_id');
    }

    // Esperar unos segundos porque el procesamiento de video en IG no es inmediato
    // Idealmente, se debe sondear el estado (status_code === 'FINISHED'), 
    // pero para archivos que ya están online y son cortos, un par de segundos suele bastar
    // (O la API de publicación puede rechazar si aún está IN_PROGRESS)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Paso 2: Publicar el contenedor
    const publishUrl = new URL(`https://graph.instagram.com/v22.0/${igUserId}/media_publish`);
    publishUrl.searchParams.append('access_token', accessToken);
    publishUrl.searchParams.append('creation_id', creationId);

    const publishResponse = await fetch(publishUrl.toString(), {
      method: 'POST',
    });

    const publishData = await publishResponse.json();

    if (publishData.error) {
      console.error('Instagram publish media error:', publishData.error);
      throw new Error(`Error al publicar Reels IG: ${publishData.error.message || JSON.stringify(publishData.error)}`);
    }

    if (!publishData.id) {
      throw new Error('Instagram no devolvió el ID de la publicación');
    }

    return { id: publishData.id };
  } catch (error: any) {
    console.error('Error en uploadToInstagram:', error);
    throw error;
  }
}
