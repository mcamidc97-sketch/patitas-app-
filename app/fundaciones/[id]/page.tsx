import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdoptButton from '@/app/components/AdoptButton'

export const metadata: Metadata = { title: 'Fundación — Patitas' }

const BG_CLASES = [
  'from-amber-300 to-orange-200',
  'from-sky-300 to-blue-200',
  'from-rose-300 to-pink-200',
  'from-lime-300 to-emerald-200',
  'from-violet-300 to-purple-200',
  'from-teal-300 to-cyan-200',
]

const TAMAÑO_LABEL: Record<string, string> = {
  pequeño: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande',
}

export default async function FundacionPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: fundacion }, { data: { user } }] = await Promise.all([
    supabase
      .from('perfiles_fundacion')
      .select('id, nombre_fundacion, ciudad, departamento, logo_url, verificado, descripcion, telefono, enlace_donacion')
      .eq('id', id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ])

  if (!fundacion) redirect('/')

  const { data: rawPerritos } = await supabase
    .from('perritos')
    .select('*')
    .eq('fundacion_id', id)
    .eq('estado', 'disponible')
    .order('created_at', { ascending: false })

  const perritos = (rawPerritos ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    fundacion_id: String(p.fundacion_id ?? ''),
    nombre: String(p.nombre ?? ''),
    raza: p.raza ? String(p.raza) : null,
    edad: String(p.edad ?? ''),
    tamaño: p.tamaño ? String(p.tamaño) : null,
    descripcion: p.descripcion ? String(p.descripcion) : null,
    tags: Array.isArray(p.tags) ? (p.tags as unknown[]).map(String) : [],
    vacunado: Boolean(p.vacunado),
    esterilizado: Boolean(p.esterilizado),
    foto_url: p.foto_url ? String(p.foto_url) : null,
    enlace_donacion: fundacion.enlace_donacion ? String(fundacion.enlace_donacion) : null,
  }))

  const iniciales = fundacion.nombre_fundacion
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const usuarioLogueado = !!user

  return (
    <div className="min-h-screen bg-orange-50 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-80 right-3 text-6xl opacity-[0.06] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-2/3 left-2 text-5xl opacity-[0.06] bone-sway-fast" aria-hidden="true">🦴</span>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14 max-w-2xl mx-auto">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500 flex-shrink-0"
            aria-label="Volver"
          >
            ←
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg font-bold text-orange-600 tracking-tight">Patitas</span>
          </div>
          {user && (
            <Link
              href="/"
              className="text-xs text-stone-500 font-medium hover:text-orange-500 transition-colors"
            >
              Inicio
            </Link>
          )}
        </div>
      </header>

      {/* Foundation hero */}
      <div className="bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 px-4 pt-10 pb-16 text-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-sm mx-auto">
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg">
            {fundacion.logo_url ? (
              <img
                src={fundacion.logo_url}
                alt={fundacion.nombre_fundacion}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-extrabold text-white">{iniciales}</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold mb-1 leading-tight">{fundacion.nombre_fundacion}</h1>
          {fundacion.verificado && (
            <span className="inline-block text-xs bg-emerald-400/30 border border-emerald-300/50 text-white font-bold px-3 py-1 rounded-full mb-2">
              ✓ Fundación verificada
            </span>
          )}
          {(fundacion.ciudad || fundacion.departamento) && (
            <p className="text-orange-100 text-sm">
              📍 {[fundacion.ciudad, fundacion.departamento].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <span className="pointer-events-none select-none absolute top-6 right-8 text-4xl opacity-20 paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-8 left-6 text-3xl opacity-20 bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute top-10 left-12 text-2xl opacity-15 paw-float-slow" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-12 right-14 text-2xl opacity-15 bone-sway-fast" aria-hidden="true">🦴</span>
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* Contact card */}
        <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-5 mb-6">
          {fundacion.descripcion && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-stone-700 mb-1">Nuestra historia</h2>
              <p className="text-sm text-stone-500 leading-relaxed">{fundacion.descripcion}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {fundacion.telefono && (
              <a
                href={`https://wa.me/${fundacion.telefono.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
            {fundacion.enlace_donacion && (
              <a
                href={fundacion.enlace_donacion}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                ❤️ Donar
              </a>
            )}
          </div>
        </div>

        {/* Dogs section */}
        <h2 className="text-base font-bold text-stone-800 mb-3">
          Perritos disponibles ({perritos.length})
        </h2>

        {perritos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <div className="text-5xl mb-3">🐾</div>
            <p className="font-semibold text-stone-500 mb-1">Sin perritos disponibles</p>
            <p className="text-sm text-stone-400">
              Esta fundación aún no tiene perritos publicados para adopción.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {perritos.map((perrito) => {
              const colorIdx = perrito.nombre.charCodeAt(0) % BG_CLASES.length
              const bgClass = BG_CLASES[colorIdx]
              return (
                <article
                  key={perrito.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:shadow-md transition-shadow"
                >
                  <div className={`bg-gradient-to-br ${bgClass} h-52 flex items-center justify-center relative overflow-hidden`}>
                    {perrito.foto_url ? (
                      <img
                        src={perrito.foto_url}
                        alt={perrito.nombre}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl">🐶</span>
                    )}
                    {perrito.tamaño && (
                      <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-stone-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        {TAMAÑO_LABEL[perrito.tamaño] ?? perrito.tamaño}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-stone-800 text-lg leading-tight">{perrito.nombre}</h3>
                        {perrito.raza && (
                          <p className="text-stone-400 text-xs mt-0.5">{perrito.raza}</p>
                        )}
                      </div>
                      <span className="shrink-0 ml-2 text-xs bg-orange-50 text-orange-500 font-semibold px-2.5 py-1 rounded-full border border-orange-100">
                        {perrito.edad}
                      </span>
                    </div>

                    {perrito.descripcion && (
                      <p className="text-stone-500 text-sm leading-relaxed mb-3 line-clamp-2">
                        {perrito.descripcion}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {perrito.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-rose-50 text-rose-400 px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {perrito.vacunado && (
                        <span className="text-xs bg-emerald-50 text-emerald-500 px-2.5 py-0.5 rounded-full font-medium">
                          ✓ Vacunado
                        </span>
                      )}
                      {perrito.esterilizado && (
                        <span className="text-xs bg-sky-50 text-sky-400 px-2.5 py-0.5 rounded-full font-medium">
                          ✓ Esterilizado
                        </span>
                      )}
                    </div>

                    <AdoptButton
                      dogName={perrito.nombre}
                      perritoId={perrito.id}
                      fundacionId={perrito.fundacion_id}
                      usuarioLogueado={usuarioLogueado}
                      enlaceDonacion={perrito.enlace_donacion ?? undefined}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
