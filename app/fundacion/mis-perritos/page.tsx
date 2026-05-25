import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GestionarPerritos from './GestionarPerritos'

export const metadata: Metadata = {
  title: 'Mis perritos — Patitas',
}

export default async function MisPerritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?from=mis-perritos')

  const { data: fundacion } = await supabase
    .from('perfiles_fundacion')
    .select('nombre_fundacion')
    .eq('id', user.id)
    .single()

  if (!fundacion) redirect('/?error=solo_fundaciones')

  const { data: perritosRaw } = await supabase
    .from('perritos')
    .select('id, nombre, raza, edad, estado, foto_url, created_at')
    .eq('fundacion_id', user.id)
    .order('created_at', { ascending: false })

  const perritos = (perritosRaw ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    nombre: String(p.nombre ?? ''),
    raza: p.raza ? String(p.raza) : null,
    edad: String(p.edad ?? ''),
    estado: String(p.estado ?? 'disponible'),
    foto_url: p.foto_url ? String(p.foto_url) : null,
    created_at: String(p.created_at ?? ''),
  }))

  const disponibles = perritos.filter((p) => p.estado !== 'adoptado').length
  const adoptados = perritos.filter((p) => p.estado === 'adoptado').length

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-20 right-3 text-6xl opacity-[0.06] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-1/3 left-2 text-5xl opacity-[0.06] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute bottom-24 right-5 text-4xl opacity-[0.06] paw-float-delay" aria-hidden="true">🐾</span>
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
            <p className="text-xs text-stone-400 truncate">{fundacion.nombre_fundacion}</p>
            <p className="text-sm font-bold text-stone-800 leading-tight">Mis perritos</p>
          </div>
          <Link
            href="/fundacion/nuevo-perrito"
            className="text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
          >
            + Publicar
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto pb-16">
        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-orange-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-orange-500">{disponibles}</p>
            <p className="text-xs text-stone-400 mt-0.5">En adopción</p>
          </div>
          <div className="bg-white rounded-2xl border border-sky-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-sky-500">{adoptados}</p>
            <p className="text-xs text-stone-400 mt-0.5">Adoptados 🎉</p>
          </div>
        </div>

        <GestionarPerritos perritos={perritos} />
      </main>
    </div>
  )
}
