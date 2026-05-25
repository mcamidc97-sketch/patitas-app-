-- ============================================================
-- Agrega foto_url y descripcion a perfiles_usuario
-- Crea bucket fotos-perfil para avatares y logos
-- ============================================================

ALTER TABLE public.perfiles_usuario
  ADD COLUMN IF NOT EXISTS foto_url   TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Bucket público para fotos de perfil (usuarios y fundaciones)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-perfil', 'fotos-perfil', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fotos de perfil son públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos-perfil');

CREATE POLICY "Usuarios suben su propia foto de perfil"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fotos-perfil'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios actualizan su propia foto de perfil"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'fotos-perfil'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios eliminan su propia foto de perfil"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fotos-perfil'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
