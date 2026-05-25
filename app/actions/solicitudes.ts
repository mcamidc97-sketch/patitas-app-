'use server'

import { createClient } from '@/lib/supabase/server'

export async function registrarInteres(
  perritoId: string,
  fundacionId: string,
  tipoInteres: 'adoptar' | 'apadrinar'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'login' }

  const { error } = await supabase.from('solicitudes').insert({
    usuario_id: user.id,
    perrito_id: perritoId,
    fundacion_id: fundacionId,
    tipo_interes: tipoInteres,
  })

  // 23505 = unique_violation: ya había registrado interés antes
  if (error?.code === '23505') return { ok: true, yaRegistrado: true }
  if (error) return { error: error.message }
  return { ok: true }
}
