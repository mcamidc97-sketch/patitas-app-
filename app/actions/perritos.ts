'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type PerritoState = {
  error?: string
  exito?: boolean
  perritoNombre?: string
}

export async function guardarPerrito(
  prevState: PerritoState,
  formData: FormData
): Promise<PerritoState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para publicar perritos.' }

  // Verificar que el usuario es una fundación registrada
  const { data: fundacion } = await supabase
    .from('perfiles_fundacion')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!fundacion) return { error: 'Solo las fundaciones pueden publicar perritos.' }

  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre del perrito es requerido.' }

  const edad = (formData.get('edad') as string)?.trim()
  if (!edad) return { error: 'La edad es requerida.' }

  // La foto ya fue subida desde el browser — solo leemos la URL
  const fotoUrl = (formData.get('foto_url') as string) || null

  const tags = formData.getAll('tags') as string[]

  const { error: insertError } = await supabase.from('perritos').insert({
    fundacion_id: user.id,
    nombre,
    raza: (formData.get('raza') as string)?.trim() || null,
    edad,
    tamaño: (formData.get('tamaño') as string) || null,
    descripcion: (formData.get('descripcion') as string)?.trim() || null,
    tags,
    vacunado: formData.get('vacunado') === 'true',
    esterilizado: formData.get('esterilizado') === 'true',
    estado: (formData.get('estado') as string) || 'disponible',
    foto_url: fotoUrl,
  })

  if (insertError) return { error: `Error al guardar: ${insertError.message}` }

  revalidatePath('/')
  return { exito: true, perritoNombre: nombre }
}

export async function marcarAdoptado(perritoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('perritos')
    .update({ estado: 'adoptado' })
    .eq('id', perritoId)
    .eq('fundacion_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/fundacion/mis-perritos')
  return { ok: true }
}

export async function eliminarPerrito(perritoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('perritos')
    .delete()
    .eq('id', perritoId)
    .eq('fundacion_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/fundacion/mis-perritos')
  return { ok: true }
}
