-- ============================================================
-- Chat entre fundaciones y usuarios
-- ============================================================

CREATE TABLE public.conversaciones (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  fundacion_id  UUID        NOT NULL REFERENCES public.perfiles_fundacion(id) ON DELETE CASCADE,
  usuario_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fundacion_id, usuario_id)
);

CREATE TABLE public.mensajes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID        NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  emisor_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenido       TEXT        NOT NULL CHECK (char_length(contenido) > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes       ENABLE ROW LEVEL SECURITY;

-- Conversaciones: ambas partes pueden ver y la fundación puede crear
CREATE POLICY "Partes ven su conversación"
  ON public.conversaciones FOR SELECT
  USING (auth.uid() = fundacion_id OR auth.uid() = usuario_id);

CREATE POLICY "Fundación inicia conversación"
  ON public.conversaciones FOR INSERT
  WITH CHECK (auth.uid() = fundacion_id);

-- Mensajes: ambas partes pueden ver e insertar
CREATE POLICY "Partes ven mensajes"
  ON public.mensajes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversaciones c
      WHERE c.id = mensajes.conversacion_id
        AND (c.fundacion_id = auth.uid() OR c.usuario_id = auth.uid())
    )
  );

CREATE POLICY "Partes envían mensajes"
  ON public.mensajes FOR INSERT
  WITH CHECK (
    auth.uid() = emisor_id
    AND EXISTS (
      SELECT 1 FROM public.conversaciones c
      WHERE c.id = mensajes.conversacion_id
        AND (c.fundacion_id = auth.uid() OR c.usuario_id = auth.uid())
    )
  );

-- Activar Realtime para mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
