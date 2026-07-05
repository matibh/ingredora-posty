export async function uploadToFacebook(
  accessToken: string,
  videoUrl: string,
  title: string,
  description: string,
  pageId: string,
  scheduledAt?: Date
): Promise<{ id: string }> {
  try {
    const formData = new URLSearchParams();
    formData.append('access_token', accessToken);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file_url', videoUrl);

    if (scheduledAt) {
      formData.append('published', 'false');
      formData.append('scheduled_publish_time', Math.floor(scheduledAt.getTime() / 1000).toString());
    } else {
      formData.append('published', 'true');
    }

    const response = await fetch(`https://graph.facebook.com/v22.0/${pageId}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Facebook upload error response:', data.error);
      throw new Error(`Error de Facebook: ${data.error.message || JSON.stringify(data.error)}`);
    }

    if (!data.id) {
      throw new Error('Facebook no devolvió el ID del video');
    }

    return { id: data.id };
  } catch (error: any) {
    console.error('Error en uploadToFacebook:', error);
    throw error;
  }
}
