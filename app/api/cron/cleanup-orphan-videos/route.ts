import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  return handleCron(request)
}

export async function POST(request: Request) {
  return handleCron(request)
}

async function handleCron(request: Request) {
  try {
    const url = new URL(request.url)
    const secretParam = url.searchParams.get('secret')
    const authHeader = request.headers.get('authorization')
    
    // Validación de seguridad (Cron Secret)
    const expectedSecret = process.env.CRON_SECRET
    if (expectedSecret) {
      const isAuthorized = secretParam === expectedSecret || authHeader === `Bearer ${expectedSecret}`
      if (!isAuthorized) {
        console.warn('[cleanup-orphan-videos] Intento de acceso no autorizado')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = await createClient()
    const bucketName = 'videos'

    // 1. Listar el directorio raíz del bucket
    const { data: rootItems, error: rootError } = await supabase.storage.from(bucketName).list()
    
    if (rootError) {
      console.error('[cleanup-orphan-videos] Error listando raíz de storage:', rootError)
      return NextResponse.json({ error: rootError.message }, { status: 500 })
    }

    if (!rootItems || rootItems.length === 0) {
      console.log('[cleanup-orphan-videos] El bucket está vacío.')
      return NextResponse.json({ total: 0, deleted: 0 })
    }

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    let totalChecked = 0
    let totalDeleted = 0

    // 2. Iterar sobre las carpetas (cada carpeta es un user_id)
    for (const item of rootItems) {
      // En Supabase, si `id` es nulo, típicamente es una carpeta
      if (!item.id) {
        const folderName = item.name
        
        // Evitar procesar el placeholder oculto ".emptyFolderPlaceholder" si existe
        if (folderName.startsWith('.emptyFolderPlaceholder')) continue

        // Listar archivos dentro de la carpeta
        const { data: files, error: filesError } = await supabase.storage.from(bucketName).list(folderName)
        
        if (filesError || !files) {
          console.error(`[cleanup-orphan-videos] Error listando carpeta ${folderName}:`, filesError)
          continue
        }

        for (const file of files) {
          // Ignorar si es otra carpeta anidada
          if (!file.id) continue
          
          const fileDateStr = file.created_at || file.updated_at || file.last_accessed_at
          if (!fileDateStr) continue
          
          const fileDate = new Date(fileDateStr)

          // 3. Si el archivo es más viejo que 2 horas, comprobar si es huérfano
          if (fileDate < twoHoursAgo) {
            totalChecked++
            const filePath = `${folderName}/${file.name}`
            const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
            const publicUrl = urlData.publicUrl

            // Buscar en la base de datos si existe algún job asociado a esta URL
            const { count, error: countError } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('video_url', publicUrl)

            if (countError) {
              console.error(`[cleanup-orphan-videos] Error verificando job para ${publicUrl}:`, countError)
              continue
            }

            // 4. Si no hay job asociado, es un archivo huérfano: eliminarlo
            if (count === 0) {
              console.log(`[cleanup-orphan-videos] 🗑️ Archivo huérfano detectado: ${filePath} (${fileDate.toISOString()})`)
              
              const { error: removeError } = await supabase.storage.from(bucketName).remove([filePath])
              
              if (removeError) {
                console.error(`[cleanup-orphan-videos] ❌ Error eliminando ${filePath}:`, removeError.message)
              } else {
                totalDeleted++
                console.log(`[cleanup-orphan-videos] ✅ Eliminado exitosamente: ${filePath}`)
              }
            }
          }
        }
      } else {
        // Archivos sueltos en la raíz del bucket
        const file = item
        const fileDateStr = file.created_at || file.updated_at || file.last_accessed_at
        if (!fileDateStr) continue
        
        const fileDate = new Date(fileDateStr)

        if (fileDate < twoHoursAgo) {
          totalChecked++
          const filePath = file.name
          const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
          const publicUrl = urlData.publicUrl

          const { count, error: countError } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('video_url', publicUrl)

          if (countError) continue

          if (count === 0) {
            console.log(`[cleanup-orphan-videos] 🗑️ Archivo huérfano detectado en raíz: ${filePath}`)
            const { error: removeError } = await supabase.storage.from(bucketName).remove([filePath])
            if (!removeError) {
              totalDeleted++
              console.log(`[cleanup-orphan-videos] ✅ Eliminado exitosamente: ${filePath}`)
            } else {
              console.error(`[cleanup-orphan-videos] ❌ Error eliminando ${filePath}:`, removeError.message)
            }
          }
        }
      }
    }

    console.log(`[cleanup-orphan-videos] Limpieza finalizada. Revisados: ${totalChecked}. Eliminados: ${totalDeleted}.`)
    return NextResponse.json({ total: totalChecked, deleted: totalDeleted })

  } catch (error) {
    console.error('[cleanup-orphan-videos] ❌ Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
