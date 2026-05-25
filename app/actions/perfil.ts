'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function guardarPerfilFundacion(data: {
  descripcion: string
  ciudad: string
  departamento: string
  telefono: string
  enlace_donacion: string
  logo_url?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const updates: Record<string, string | null> = {
    descripcion: data.descripcion || null,
    ciudad: data.ciudad || null,
    departamento: data.departamento || null,
    telefono: data.telefono || null,
    enlace_donacion: data.enlace_donacion || null,
  }
  if (data.logo_url !== undefined) updates.logo_url = data.logo_url

  const { error } = await supabase
    .from('perfiles_fundacion')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/fundacion/perfil')
  return { ok: true }
}

export async function guardarPerfilUsuario(data: {
  nombre_completo: string
  telefono: string
  ciudad: string
  departamento: string
  tipo_usuario: string
  descripcion: string
  foto_url?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const row: Record<string, string | null> = {
    id: user.id,
    email: user.email!,
    nombre_completo: data.nombre_completo || 'Sin nombre',
    telefono: data.telefono || null,
    ciudad: data.ciudad || null,
    departamento: data.departamento || null,
    tipo_usuario: data.tipo_usuario,
    descripcion: data.descripcion || null,
  }
  if (data.foto_url !== undefined) row.foto_url = data.foto_url

  const { error } = await supabase
    .from('perfiles_usuario')
    .upsert(row, { onConflict: 'id' })

  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/perfil')
  return { ok: true }
}
