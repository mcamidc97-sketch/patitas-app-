import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Mis conversaciones — Patitas' }

export default async function MisConversacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?from=mis-conversaciones')

  // Verificar si es fundación o usuario normal
  const { data: esFundData } = await supabase
    .from('perfiles_fundacion')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  const esFundacion = !!esFundData

  const { data: rawConvs } = await supabase
    .from('conversaciones')
    .select('id, fundacion_id, usuario_id, created_at')
    .or(`fundacion_id.eq.${user.id},usuario_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const convs = rawConvs ?? []

  // Obtener nombre del otro participante para cada conversación
  const otrosIds = convs.map((c: Record<string, unknown>) =>
    esFundacion ? String(c.usuario_id) : String(c.fundacion_id)
  )

  const [perfilesUsuario, perfilesFundacion] = await Promise.all([
    esFundacion && otrosIds.length > 0
      ? supabase
          .from('perfiles_usuario')
          .select('id, nombre_completo')
          .in('id', otrosIds)
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
    !esFundacion && otrosIds.length > 0
      ? supabase
          .from('perfiles_fundacion')
          .select('id, nombre_fundacion, logo_url')
          .in('id', otrosIds)
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
  ])

  const nombreMap: Record<string, { nombre: string; foto: string | null }> = {}
  ;(perfilesUsuario as Record<string, unknown>[]).forEach((p) => {
    nombreMap[String(p.id)] = { nombre: String(p.nombre_completo ?? ''), foto: null }
  })
  ;(perfilesFundacion as Record<string, unknown>[]).forEach((p) => {
    nombreMap[String(p.id)] = {
      nombre: String(p.nombre_fundacion ?? ''),
      foto: p.logo_url ? String(p.logo_url) : null,
    }
  })

  const conversaciones = convs.map((c: Record<string, unknown>) => {
    const otroId = esFundacion ? String(c.usuario_id) : String(c.fundacion_id)
    const otro = nombreMap[otroId] ?? { nombre: 'Contacto', foto: null }
    return {
      id: String(c.id),
      otroNombre: otro.nombre,
      otroFoto: otro.foto,
      created_at: String(c.created_at),
    }
  })

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-20 right-3 text-6xl opacity-[0.06] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-2/5 left-2 text-5xl opacity-[0.06] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute bottom-32 right-4 text-4xl opacity-[0.06] paw-float-slow" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-12 left-5 text-3xl opacity-[0.06] bone-sway-fast" aria-hidden="true">🦴</span>
      <header className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500"
          >
            ←
          </Link>
          <p className="text-sm font-bold text-stone-800 flex-1">Mis conversaciones</p>
          <span className="text-xl">💬</span>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto pb-16">
        {conversaciones.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <p className="font-semibold text-stone-500 mb-1">Aún no tienes conversaciones</p>
            <p className="text-sm text-stone-400">
              Las fundaciones te contactarán cuando muestres interés en un perrito.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversaciones.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-orange-100 shadow-sm px-4 py-3.5 hover:border-orange-300 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-orange-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-orange-500">
                  {c.otroFoto ? (
                    <img src={c.otroFoto} alt={c.otroNombre} className="w-full h-full object-cover" />
                  ) : (
                    c.otroNombre.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800 text-sm truncate">{c.otroNombre}</p>
                  <p className="text-xs text-stone-400">
                    {esFundacion ? 'Voluntario / Apadrinador' : 'Fundación'}
                  </p>
                </div>
                <span className="text-stone-300 text-lg">›</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
