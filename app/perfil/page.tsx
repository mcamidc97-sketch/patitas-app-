import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FormPerfil from './FormPerfil'

export const metadata: Metadata = {
  title: 'Mi perfil — Patitas',
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?from=perfil')

  const { data } = await supabase
    .from('perfiles_usuario')
    .select('nombre_completo, telefono, ciudad, departamento, tipo_usuario, descripcion, foto_url')
    .eq('id', user.id)
    .maybeSingle()

  // Si no tiene fila (fundación intentando entrar aquí, o trigger falló) redirigir
  // Usamos maybeSingle para que no arroje error cuando no hay fila
  const esFundacion = !data && await supabase
    .from('perfiles_fundacion')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
    .then(r => !!r.data)

  if (esFundacion) redirect('/fundacion/perfil')

  const perfil = {
    nombre_completo: data ? String(data.nombre_completo ?? '') : '',
    telefono: data?.telefono ? String(data.telefono) : null,
    ciudad: data?.ciudad ? String(data.ciudad) : null,
    departamento: data?.departamento ? String(data.departamento) : null,
    tipo_usuario: data ? String(data.tipo_usuario ?? 'adoptante') : 'adoptante',
    descripcion: data?.descripcion ? String(data.descripcion) : null,
    foto_url: data?.foto_url ? String(data.foto_url) : null,
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-20 right-3 text-6xl opacity-[0.06] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-2/5 left-2 text-5xl opacity-[0.06] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute bottom-28 right-5 text-4xl opacity-[0.06] paw-float-delay" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-10 left-4 text-3xl opacity-[0.06] bone-sway-fast" aria-hidden="true">🦴</span>
      <header className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500"
            aria-label="Volver al inicio"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-400 truncate">{user.email}</p>
            <p className="text-sm font-bold text-stone-800 leading-tight">Mi perfil</p>
          </div>
          <span className="text-2xl" aria-hidden="true">🐾</span>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto pb-16">
        <FormPerfil perfil={perfil} userId={user.id} />
      </main>
    </div>
  )
}
