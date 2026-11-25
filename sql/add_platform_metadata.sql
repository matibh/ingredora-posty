-- Add per-platform publishing metadata to Posty's existing jobs.
-- Run this migration in the Supabase project used by Ingredora Posty.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS platform_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.jobs.platform_metadata IS
  'Imported and editable Ingredora Content Studio metadata, separated by destination platform.';
