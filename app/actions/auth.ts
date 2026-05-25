'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validarNIT } from '@/lib/validaciones/nit'

export type AuthState = {
  error?: string
  campoError?: string
  exito?: boolean
}

export async function registrarFundacion(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nombreFundacion = (formData.get('nombre_fundacion') as string)?.trim()
  const nit = (formData.get('nit') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const telefono = (formData.get('telefono') as string)?.trim() || null
  const ciudad = (formData.get('ciudad') as string)?.trim() || null
  const departamento = (formData.get('departamento') as string)?.trim() || null
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  if (!nombreFundacion)
    return { error: 'El nombre de la fundación es requerido', campoError: 'nombre_fundacion' }

  if (!nit)
    return { error: 'El NIT es requerido', campoError: 'nit' }

  const nitResult = validarNIT(nit)
  if (!nitResult.valido)
    return { error: nitResult.error, campoError: 'nit' }

  if (!email)
    return { error: 'El email es requerido', campoError: 'email' }

  if (!password || password.length < 8)
    return { error: 'La contraseña debe tener mínimo 8 caracteres', campoError: 'password' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tipo_registro: 'fundacion',
        nombre_fundacion: nombreFundacion,
        nit,
        telefono,
        ciudad,
        departamento,
        descripcion,
        enlace_donacion: null,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered'))
      return { error: 'Este email ya está registrado', campoError: 'email' }
    if (error.message.toLowerCase().includes('nit'))
      return { error: 'Este NIT ya está registrado', campoError: 'nit' }
    return { error: 'Error al registrar. Por favor intenta de nuevo.' }
  }

  return { exito: true }
}

export async function registrarUsuario(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nombreCompleto = (formData.get('nombre_completo') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const telefono = (formData.get('telefono') as string)?.trim() || null
  const ciudad = (formData.get('ciudad') as string)?.trim() || null
  const departamento = (formData.get('departamento') as string)?.trim() || null
  const tipoUsuario = (formData.get('tipo_usuario') as string) || 'adoptante'

  if (!nombreCompleto)
    return { error: 'Tu nombre completo es requerido', campoError: 'nombre_completo' }

  if (!email)
    return { error: 'El email es requerido', campoError: 'email' }

  if (!password || password.length < 8)
    return { error: 'La contraseña debe tener mínimo 8 caracteres', campoError: 'password' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tipo_registro: 'usuario',
        nombre_completo: nombreCompleto,
        telefono,
        ciudad,
        departamento,
        tipo_usuario: tipoUsuario,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered'))
      return { error: 'Este email ya está registrado', campoError: 'email' }
    return { error: 'Error al registrar. Por favor intenta de nuevo.' }
  }

  return { exito: true }
}

export async function iniciarSesion(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email)
    return { error: 'El email es requerido', campoError: 'email' }

  if (!password)
    return { error: 'La contraseña es requerida', campoError: 'password' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed'))
      return { error: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).' }
    return { error: 'Email o contraseña incorrectos' }
  }

  redirect('/')
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
