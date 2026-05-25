'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function registrarInteres(
  perritoId: string,
  fundacionId: string,
  tipo: 'adoptar' | 'apadrinar'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'login' }

  const { data: existing } = await supabase
    .from('solicitudes')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('perrito_id', perritoId)
    .maybeSingle()

  if (existing) return { yaEnviado: true }

  const { error } = await supabase.from('solicitudes').insert({
    usuario_id: user.id,
    perrito_id: perritoId,
    fundacion_id: fundacionId,
    tipo_interes: tipo,
  })

  if (error) return { error: error.message }
  return { yaEnviado: false }
}

export async function marcarSolicitudLeida(solicitudId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('solicitudes')
    .update({ leida: true })
    .eq('id', solicitudId)
    .eq('fundacion_id', user.id)

  revalidatePath('/')
}

export async function marcarSolicitudesLeidas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('solicitudes')
    .update({ leida: true })
    .eq('fundacion_id', user.id)
    .eq('leida', false)

  revalidatePath('/')
}
