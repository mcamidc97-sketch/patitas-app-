import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { iniciarConversacion } from '@/app/actions/chat'
import RouterRefresher from '@/app/components/RouterRefresher'

export const metadata: Metadata = {
  title: 'Solicitudes — Patitas',
}

const TIPO_LABEL: Record<string, string> = {
  adoptante: 'Apadrinador/a',
  voluntario: 'Voluntario/a',
  ambos: 'Apadrinador/a y Voluntario/a',
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

  // Paso 1: solicitudes + perrito (FK directa funciona)
  const { data: rawSolicitudes } = await supabase
    .from('solicitudes')
    .select('id, created_at, tipo_interes, leida, usuario_id, perritos(nombre, foto_url)')
    .eq('fundacion_id', user.id)
    .order('created_at', { ascending: false })

  // Mark all unread solicitudes as read
  await supabase
    .from('solicitudes')
    .update({ leida: true })
    .eq('fundacion_id', user.id)
    .eq('leida', false)

  // Paso 2: perfiles de los usuarios interesados (consulta separada)
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
      <RouterRefresher />
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
              Solicitudes de apadrinamiento
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
            <div className="text-6xl mb-4">💌</div>
            <p className="font-semibold text-stone-500 mb-1">Aún no hay solicitudes</p>
            <p className="text-sm text-stone-400">
              Cuando alguien muestre interés en apadrinar uno de tus perritos, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden"
              >
                {/* Perrito al que aplica */}
                <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border-b border-orange-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {s.perrito_foto ? (
                      <img src={s.perrito_foto} alt={s.perrito_nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🐶</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Interesado/a en</p>
                    <p className="text-sm font-bold text-stone-700">{s.perrito_nombre}</p>
                  </div>
                  <p className="ml-auto text-[10px] text-stone-400">
                    {new Date(s.created_at).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>

                {/* Info del usuario */}
                <div className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex-shrink-0 flex items-center justify-center text-base font-bold text-stone-500">
                      {s.usuario_nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-800 text-sm">{s.usuario_nombre}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          s.tipo_interes === 'adoptar'
                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-rose-50 text-rose-500 border-rose-200'
                        }`}>
                          {s.tipo_interes === 'adoptar' ? '🏠 Quiere adoptar' : '🐾 Quiere apadrinar'}
                        </span>
                        <span className="inline-block text-[10px] bg-stone-50 text-stone-500 font-semibold px-2 py-0.5 rounded-full border border-stone-100">
                          {TIPO_LABEL[s.usuario_tipo] ?? s.usuario_tipo}
                        </span>
                      </div>
                      {s.usuario_ciudad && (
                        <p className="text-xs text-stone-400 mt-1">📍 {s.usuario_ciudad}</p>
                      )}
                    </div>
                  </div>

                  {s.usuario_descripcion && (
                    <p className="text-sm text-stone-500 leading-relaxed mt-3 line-clamp-3">
                      {s.usuario_descripcion}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <form action={iniciarConversacion} className="flex-1">
                      <input type="hidden" name="usuario_id" value={s.usuario_id} />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        💬 Iniciar chat
                      </button>
                    </form>
                    {s.usuario_telefono && (
                      <a
                        href={`https://wa.me/${s.usuario_telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir en WhatsApp"
                        className="flex items-center justify-center w-11 bg-emerald-500 text-white font-bold text-sm py-2.5 px-3 rounded-xl hover:bg-emerald-600 transition-colors flex-shrink-0"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
