-- ============================================================
-- Agrega enlace_donacion a perfiles_fundacion
-- Ejecutar si ya corriste 001_schema_inicial.sql
-- ============================================================

ALTER TABLE public.perfiles_fundacion
  ADD COLUMN IF NOT EXISTS enlace_donacion TEXT;

-- Permite que adoptantes vean el perfil completo de cada fundación
-- (nombre + enlace_donacion se muestran en las tarjetas de perritos)
DROP POLICY IF EXISTS "Fundación ve su propio perfil" ON public.perfiles_fundacion;

CREATE POLICY IF NOT EXISTS "Perfiles de fundación son públicos"
  ON public.perfiles_fundacion FOR SELECT
  USING (true);

-- Actualiza el trigger para incluir el nuevo campo
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF new.raw_user_meta_data->>'tipo_registro' = 'fundacion' THEN
    INSERT INTO public.perfiles_fundacion (
      id, nombre_fundacion, nit, email,
      telefono, ciudad, departamento, descripcion, enlace_donacion
    ) VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'nombre_fundacion', ''),
      COALESCE(new.raw_user_meta_data->>'nit', ''),
      new.email,
      new.raw_user_meta_data->>'telefono',
      new.raw_user_meta_data->>'ciudad',
      new.raw_user_meta_data->>'departamento',
      new.raw_user_meta_data->>'descripcion',
      new.raw_user_meta_data->>'enlace_donacion'
    );
  ELSE
    INSERT INTO public.perfiles_usuario (
      id, nombre_completo, email,
      telefono, ciudad, departamento, tipo_usuario
    ) VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'nombre_completo', ''),
      new.email,
      new.raw_user_meta_data->>'telefono',
      new.raw_user_meta_data->>'ciudad',
      new.raw_user_meta_data->>'departamento',
      COALESCE(new.raw_user_meta_data->>'tipo_usuario', 'adoptante')
    );
  END IF;
  RETURN new;
END;
$$;
