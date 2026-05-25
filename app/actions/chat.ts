'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function iniciarConversacion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const usuarioId = String(formData.get('usuario_id') ?? '')
  if (!usuarioId) return

  const { data, error } = await supabase
    .from('conversaciones')
    .upsert(
      { fundacion_id: user.id, usuario_id: usuarioId },
      { onConflict: 'fundacion_id,usuario_id' }
    )
    .select('id')
    .single()

  if (error || !data) return

  redirect(`/chat/${data.id}`)
}

export async function enviarMensaje(conversacionId: string, contenido: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('mensajes').insert({
    conversacion_id: conversacionId,
    emisor_id: user.id,
    contenido: contenido.trim(),
  })

  if (error) return { error: error.message }
  return { ok: true }
}
