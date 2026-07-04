import { createClient } from '@/lib/supabase/server';

export async function cleanOrphanVideos() {
  const supabase = await createClient();
  
  // 1. Listar todas las carpetas en el bucket 'videos' (cada carpeta es un user_id)
  const { data: folders, error: foldersError } = await supabase.storage.from('videos').list();
  if (foldersError) {
    console.error('[cleanOrphanVideos] Error al listar carpetas:', foldersError);
    return { error: foldersError.message };
  }

  let totalFiles = 0;
  let deletedFiles = 0;
  const errors: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qraapmleuafdvvhnslvh.supabase.co';

  for (const folder of folders) {
    // 2. Listar archivos dentro de cada carpeta
    const { data: files, error: filesError } = await supabase.storage.from('videos').list(folder.name);
    if (filesError) {
      errors.push(`Error al listar archivos en ${folder.name}: ${filesError.message}`);
      continue;
    }

    for (const file of files) {
      totalFiles++;
      
      // 3. Verificar antigüedad (más de 2 horas)
      const fileDateStr = file.created_at || file.updated_at;
      const fileDate = fileDateStr ? new Date(fileDateStr) : new Date();
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      if (fileDate > twoHoursAgo) {
        continue; // El archivo es muy reciente, no se elimina
      }

      // 4. Construir URL pública
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/videos/${folder.name}/${file.name}`;

      // 5. Verificar si existe un job con esa URL
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('video_url', publicUrl)
        .maybeSingle();

      if (jobError) {
        errors.push(`Error al buscar job para ${file.name}: ${jobError.message}`);
        continue;
      }

      if (!job) {
        // 6. Es huérfano → eliminar
        const filePath = `${folder.name}/${file.name}`;
        const { error: deleteError } = await supabase.storage
          .from('videos')
          .remove([filePath]);

        if (deleteError) {
          errors.push(`Error al eliminar ${filePath}: ${deleteError.message}`);
        } else {
          deletedFiles++;
        }
      }
    }
  }

  return { total: totalFiles, deleted: deletedFiles, errors };
}
