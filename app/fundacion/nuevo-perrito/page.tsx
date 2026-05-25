import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FormNuevoPerrito from './FormNuevoPerrito'

export const metadata: Metadata = {
  title: 'Publicar perrito — Patitas',
  description: 'Publica un perrito en adopción en la plataforma Patitas.',
}

export default async function NuevoPerritoPage() {
  let fundacionNombre = 'Mi Fundación'
  let modoDemo = false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseConfigured = supabaseUrl.startsWith('https://') && !supabaseUrl.includes('TU_PROYECTO')

  if (!supabaseConfigured) {
    modoDemo = true
  } else {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect('/login?from=nuevo-perrito')

      const { data: fundacion } = await supabase
        .from('perfiles_fundacion')
        .select('nombre_fundacion')
        .eq('id', user.id)
        .single()

      if (!fundacion) redirect('/?error=solo_fundaciones')

      fundacionNombre = fundacion.nombre_fundacion
    } catch (e: unknown) {
      if (e !== null && typeof e === 'object' && 'digest' in e) throw e
      modoDemo = true
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-20 right-3 text-5xl opacity-[0.07] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-1/2 left-2 text-5xl opacity-[0.06] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute bottom-20 right-4 text-4xl opacity-[0.06] paw-float-slow" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-8 left-5 text-3xl opacity-[0.06] bone-sway-fast" aria-hidden="true">🦴</span>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500"
            aria-label="Volver"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-400 truncate">{fundacionNombre}</p>
            <p className="text-sm font-bold text-stone-800 leading-tight">Publicar un perrito</p>
          </div>
          <span className="text-2xl">🐾</span>
        </div>
      </header>

      {/* Demo banner */}
      {modoDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center">
          <p className="text-xs text-amber-700 font-medium">
            Vista previa — Configura Supabase en{' '}
            <code className="bg-amber-100 px-1 rounded">.env.local</code>{' '}
            para guardar datos reales.
          </p>
        </div>
      )}

      {/* Form */}
      <main className="px-4 py-6 max-w-lg mx-auto pb-16">
        <FormNuevoPerrito />
      </main>
    </div>
  )
}
