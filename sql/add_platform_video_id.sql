-- Migración: Agregar columna platform_video_id a la tabla jobs
-- Ejecutar en el SQL Editor de Supabase: https://app.supabase.com

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS platform_video_id TEXT;

-- Comentario descriptivo
COMMENT ON COLUMN public.jobs.platform_video_id IS 'ID del video en la plataforma de destino (ej: YouTube video ID)';
