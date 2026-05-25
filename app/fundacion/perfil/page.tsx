import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FormPerfilFundacion from './FormPerfilFundacion'

export const metadata: Metadata = {
  title: 'Mi perfil — Patitas',
}

export default async function PerfilFundacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?from=perfil')

  const { data } = await supabase
    .from('perfiles_fundacion')
    .select('nombre_fundacion, nit, descripcion, ciudad, departamento, telefono, enlace_donacion, logo_url')
    .eq('id', user.id)
    .single()

  if (!data) redirect('/?error=solo_fundaciones')

  const perfil = {
    nombre_fundacion: String(data.nombre_fundacion ?? ''),
    nit: String(data.nit ?? ''),
    descripcion: data.descripcion ? String(data.descripcion) : null,
    ciudad: data.ciudad ? String(data.ciudad) : null,
    departamento: data.departamento ? String(data.departamento) : null,
    telefono: data.telefono ? String(data.telefono) : null,
    enlace_donacion: data.enlace_donacion ? String(data.enlace_donacion) : null,
    logo_url: data.logo_url ? String(data.logo_url) : null,
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-20 right-3 text-6xl opacity-[0.06] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-1/2 left-2 text-5xl opacity-[0.06] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute bottom-24 right-5 text-4xl opacity-[0.06] paw-float-slow" aria-hidden="true">🐾</span>
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
            <p className="text-xs text-stone-400 truncate">{perfil.nombre_fundacion}</p>
            <p className="text-sm font-bold text-stone-800 leading-tight">Mi perfil</p>
          </div>
          <span className="text-2xl" aria-hidden="true">🏢</span>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto pb-16">
        <FormPerfilFundacion perfil={perfil} userId={user.id} />
      </main>
    </div>
  )
}
