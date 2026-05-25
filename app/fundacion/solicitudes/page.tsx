import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SolicitudCard from '@/app/components/SolicitudCard'

export const metadata: Metadata = {
  title: 'Solicitudes — Patitas',
}

export default async function SolicitudesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?from=solicitudes')

  const { data: fundacion } = await supabase
    .from('perfiles_fundacion')
    .select('nombre_fundacion')
    .eq('id', user.id)
    .single()

  if (!fundacion) redirect('/?error=solo_fundaciones')

  const { data: rawSolicitudes } = await supabase
    .from('solicitudes')
    .select('id, created_at, tipo_interes, usuario_id, perritos(nombre, foto_url)')
    .eq('fundacion_id', user.id)
    .eq('leida', false)
    .order('created_at', { ascending: false })

  const usuarioIds = [...new Set((rawSolicitudes ?? []).map((s: Record<string, unknown>) => String(s.usuario_id)))]
  const { data: rawPerfiles } = usuarioIds.length > 0
    ? await supabase
        .from('perfiles_usuario')
        .select('id, nombre_completo, descripcion, tipo_usuario, telefono, ciudad')
        .in('id', usuarioIds)
    : { data: [] }

  const perfilMap = Object.fromEntries(
    (rawPerfiles ?? []).map((p: Record<string, unknown>) => [String(p.id), p])
  )

  const solicitudes = (rawSolicitudes ?? []).map((s: Record<string, unknown>) => {
    const perrito = (Array.isArray(s.perritos) ? s.perritos[0] : s.perritos) as Record<string, unknown> | null
    const usuario = perfilMap[String(s.usuario_id)] as Record<string, unknown> | undefined
    return {
      id: String(s.id),
      usuario_id: String(s.usuario_id),
      created_at: String(s.created_at ?? ''),
      tipo_interes: String(s.tipo_interes ?? 'adoptar'),
      perrito_nombre: perrito ? String(perrito.nombre ?? '') : 'Perrito eliminado',
      perrito_foto: perrito?.foto_url ? String(perrito.foto_url) : null,
      usuario_nombre: usuario ? String(usuario.nombre_completo ?? '') : 'Usuario desconocido',
      usuario_descripcion: usuario?.descripcion ? String(usuario.descripcion) : null,
      usuario_tipo: usuario ? String(usuario.tipo_usuario ?? 'adoptante') : 'adoptante',
      usuario_telefono: usuario?.telefono ? String(usuario.telefono) : null,
      usuario_ciudad: usuario?.ciudad ? String(usuario.ciudad) : null,
    }
  })

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-20 right-3 text-6xl opacity-[0.06] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-1/2 left-2 text-5xl opacity-[0.06] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute bottom-28 right-5 text-4xl opacity-[0.06] paw-float-slow" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-10 left-4 text-3xl opacity-[0.06] bone-sway-fast" aria-hidden="true">🦴</span>
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
            <p className="text-xs text-stone-400 truncate">{fundacion.nombre_fundacion}</p>
            <p className="text-sm font-bold text-stone-800 leading-tight">
              Solicitudes pendientes
            </p>
          </div>
          <Link
            href="/mis-conversaciones"
            className="flex items-center gap-1.5 text-xs bg-orange-500 text-white font-bold px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
          >
            💬 Mis chats
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto pb-16">
        {solicitudes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <p className="font-semibold text-stone-500 mb-1">Todo al día</p>
            <p className="text-sm text-stone-400">
              No tienes solicitudes pendientes por atender.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((s) => (
              <SolicitudCard key={s.id} {...s} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
