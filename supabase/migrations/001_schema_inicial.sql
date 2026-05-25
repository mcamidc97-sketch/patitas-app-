-- ============================================================
-- Patitas App — Schema inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabla de fundaciones registradas
CREATE TABLE public.perfiles_fundacion (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_fundacion  TEXT        NOT NULL,
  nit           VARCHAR(12) UNIQUE NOT NULL,
  email         TEXT        NOT NULL,
  telefono      VARCHAR(20),
  ciudad        TEXT,
  departamento  TEXT,
  descripcion   TEXT,
  enlace_donacion TEXT,
  verificado    BOOLEAN     NOT NULL DEFAULT FALSE,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de usuarios normales (voluntarios / adoptantes)
CREATE TABLE public.perfiles_usuario (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  telefono        VARCHAR(20),
  ciudad          TEXT,
  departamento    TEXT,
  tipo_usuario    TEXT        NOT NULL DEFAULT 'adoptante'
                  CHECK (tipo_usuario IN ('voluntario', 'adoptante', 'ambos')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de perritos publicados por fundaciones
CREATE TABLE public.perritos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  fundacion_id  UUID        NOT NULL REFERENCES public.perfiles_fundacion(id) ON DELETE CASCADE,
  nombre        TEXT        NOT NULL,
  raza          TEXT,
  edad          TEXT,
  tamaño        TEXT        CHECK (tamaño IN ('pequeño', 'mediano', 'grande')),
  descripcion   TEXT,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  vacunado      BOOLEAN     NOT NULL DEFAULT FALSE,
  esterilizado  BOOLEAN     NOT NULL DEFAULT FALSE,
  estado        TEXT        NOT NULL DEFAULT 'disponible'
                CHECK (estado IN ('disponible', 'en_proceso', 'adoptado')),
  foto_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.perfiles_fundacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_usuario    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perritos            ENABLE ROW LEVEL SECURITY;

-- perfiles_fundacion — lectura pública (nombre, enlace_donacion visible en tarjetas de perritos)
CREATE POLICY "Perfiles de fundación son públicos"
  ON public.perfiles_fundacion FOR SELECT
  USING (true);

CREATE POLICY "Fundación actualiza solo su perfil"
  ON public.perfiles_fundacion FOR UPDATE
  USING (auth.uid() = id);

-- perfiles_usuario
CREATE POLICY "Usuario ve su propio perfil"
  ON public.perfiles_usuario FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuario actualiza su perfil"
  ON public.perfiles_usuario FOR UPDATE
  USING (auth.uid() = id);

-- perritos — lectura pública para disponibles
CREATE POLICY "Todos ven perritos disponibles"
  ON public.perritos FOR SELECT
  USING (estado = 'disponible');

-- fundación gestiona sus propios perritos
CREATE POLICY "Fundación gestiona sus perritos"
  ON public.perritos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles_fundacion f
      WHERE f.id = auth.uid() AND f.id = perritos.fundacion_id
    )
  );

-- ============================================================
-- Función automática: crea perfil al registrarse
-- El trigger lee raw_user_meta_data para saber el tipo
-- ============================================================
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

-- Trigger automático al crear un nuevo usuario en auth.users
CREATE TRIGGER al_crear_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- ============================================================
-- Triggers para updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$;

CREATE TRIGGER ts_fundacion
  BEFORE UPDATE ON public.perfiles_fundacion
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER ts_usuario
  BEFORE UPDATE ON public.perfiles_usuario
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER ts_perrito
  BEFORE UPDATE ON public.perritos
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
