-- Permite que el usuario cree su propio perfil si no existe (upsert desde el cliente)
CREATE POLICY "Usuario inserta su propio perfil"
  ON public.perfiles_usuario FOR INSERT
  WITH CHECK (auth.uid() = id);
