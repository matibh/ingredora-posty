# Posty 🚀

Posty es una herramienta diseñada para creadores de contenido que permite subir un video y publicarlo automáticamente en YouTube, Instagram, Facebook y TikTok con un solo clic.

## Características

- **Publicación Directa Simultánea:** Sube tu video una sola vez y reprodúcelo en las 4 plataformas más importantes del mundo al mismo tiempo usando llamadas en paralelo.
- **Rachas y Gamificación:** Mantén tu constancia con el sistema de rachas diarias para no perder el ritmo de publicación.
- **Interfaz Limpia y Profesional:** Diseñada como un SaaS moderno, intuitivo y sin distracciones.
- **Sin Dependencias Pesadas:** Todo el flujo se maneja desde el backend de Next.js conectando con las APIs oficiales, sin necesidad de procesar video del lado del servidor.

## Stack Tecnológico

- **Frontend:** Next.js 14, React, TailwindCSS.
- **Autenticación y Base de Datos:** Supabase (Auth, Postgres, Storage).
- **Despliegue:** Vercel.

## Flujo de Trabajo

1. **Subir:** El usuario arrastra un video en el dashboard.
2. **Cola:** El video se sube a Supabase Storage y se crea un registro (`job`) en la base de datos con estado `pending`.
3. **Publicar:** La API de publicación recoge el trabajo y las credenciales (OAuth) de las distintas plataformas y despacha llamadas en paralelo (`Promise.all`). El estado pasa a `publishing`.
4. **Completado:** Una vez confirmadas las publicaciones, el estado cambia a `done` mostrando los links directos a las redes sociales del usuario.

## Configuración de Supabase

Para utilizar Posty, la tabla `jobs` debe tener la siguiente estructura mínima en Supabase:

```sql
CREATE TABLE public.jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'publishing', 'done', 'error')),
  error_message TEXT,
  created_at timestamp with time zone DEFAULT now()
);
```

## Ejecución Local

1. Clona el repositorio.
2. Copia `.env.example` a `.env.local` y agrega tus claves de Supabase.
3. Instala las dependencias: `npm install`
4. Levanta el entorno: `npm run dev`
5. Abre [http://localhost:3000](http://localhost:3000)
