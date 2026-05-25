-- ============================================================
-- Storage: bucket de fotos de perritos
-- Ejecutar DESPUÉS de 001_schema_inicial.sql
-- ============================================================

-- Crear bucket público para fotos de perritos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-perritos', 'fotos-perritos', true)
ON CONFLICT (id) DO NOTHING;

-- Cualquier persona puede ver las fotos (bucket público)
CREATE POLICY "Fotos son públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos-perritos');

-- Solo fundaciones autenticadas pueden subir fotos
CREATE POLICY "Fundaciones pueden subir fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fotos-perritos'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.perfiles_fundacion
      WHERE id = auth.uid()
    )
  );

-- Las fundaciones solo pueden modificar/eliminar sus propias fotos
CREATE POLICY "Fundaciones gestionan sus fotos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fotos-perritos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
