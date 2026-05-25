-- Tabla de solicitudes de adopción / apadrinamiento
CREATE TABLE public.solicitudes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perrito_id    UUID        NOT NULL REFERENCES public.perritos(id) ON DELETE CASCADE,
  fundacion_id  UUID        NOT NULL REFERENCES public.perfiles_fundacion(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, perrito_id)
);

ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario registra su interés"
  ON public.solicitudes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuario ve sus propias solicitudes"
  ON public.solicitudes FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Fundación ve solicitudes de sus perritos"
  ON public.solicitudes FOR SELECT
  USING (auth.uid() = fundacion_id);

CREATE POLICY "Fundación elimina solicitudes de sus perritos"
  ON public.solicitudes FOR DELETE
  USING (auth.uid() = fundacion_id);
