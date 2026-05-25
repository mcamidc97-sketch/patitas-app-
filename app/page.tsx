import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdoptButton from './components/AdoptButton'
import FavoritoButton from './components/FavoritoButton'
import BuscarFundaciones from './components/BuscarFundaciones'

type PerritoReal = {
  id: string
  fundacion_id: string
  nombre: string
  raza: string | null
  edad: string
  tamaño: string | null
  descripcion: string | null
  tags: string[]
  vacunado: boolean
  esterilizado: boolean
  foto_url: string | null
  perfiles_fundacion: {
    nombre_fundacion: string
    enlace_donacion: string | null
  } | null
}

type Fundacion = {
  id: string
  nombre_fundacion: string
  ciudad: string | null
  logo_url: string | null
  verificado: boolean
  descripcion: string | null
  telefono: string | null
}

// ── SVG DECORATIVOS ─────────────────────────────────────────

function DogIllustration() {
  return (
    <svg viewBox="0 0 120 148" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Tail */}
      <path d="M88 104 C106 90 110 68 98 54" stroke="#fb923c" strokeWidth="8" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="60" cy="118" rx="40" ry="26" fill="#fed7aa"/>
      {/* Neck */}
      <ellipse cx="60" cy="96" rx="19" ry="14" fill="#fed7aa"/>
      {/* Left ear */}
      <ellipse cx="36" cy="44" rx="11" ry="20" fill="#f97316" transform="rotate(-18 36 44)"/>
      {/* Right ear */}
      <ellipse cx="84" cy="44" rx="11" ry="20" fill="#f97316" transform="rotate(18 84 44)"/>
      {/* Head */}
      <circle cx="60" cy="60" r="30" fill="#fed7aa"/>
      {/* Inner ears */}
      <ellipse cx="36" cy="45" rx="6" ry="12" fill="#fdba74" transform="rotate(-18 36 45)"/>
      <ellipse cx="84" cy="45" rx="6" ry="12" fill="#fdba74" transform="rotate(18 84 45)"/>
      {/* Snout */}
      <ellipse cx="60" cy="73" rx="16" ry="12" fill="#fef3c7"/>
      {/* Nose */}
      <path d="M54 68 Q60 65 66 68 Q63 73 57 73 Z" fill="#292524"/>
      {/* Left eye */}
      <circle cx="46" cy="55" r="6.5" fill="#1c1917"/>
      <circle cx="48" cy="52.5" r="2.5" fill="white"/>
      {/* Right eye */}
      <circle cx="74" cy="55" r="6.5" fill="#1c1917"/>
      <circle cx="76" cy="52.5" r="2.5" fill="white"/>
      {/* Eyebrows */}
      <path d="M41 48 Q46 45 51 47" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      <path d="M69 47 Q74 45 79 48" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M53 79 Q60 86 67 79" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Tongue */}
      <ellipse cx="60" cy="84" rx="6" ry="5" fill="#f43f5e"/>
      <line x1="60" y1="80" x2="60" y2="89" stroke="#e11d48" strokeWidth="1"/>
      {/* Collar */}
      <rect x="43" y="88" width="34" height="8" rx="4" fill="#f97316"/>
      <circle cx="60" cy="100" r="4.5" fill="#fbbf24" stroke="#f97316" strokeWidth="1"/>
      {/* Front legs */}
      <rect x="32" y="128" width="16" height="15" rx="8" fill="#fed7aa"/>
      <rect x="72" y="128" width="16" height="15" rx="8" fill="#fed7aa"/>
      {/* Paw toes */}
      <circle cx="35" cy="141" r="2.5" fill="#fb923c"/>
      <circle cx="40" cy="143" r="2.5" fill="#fb923c"/>
      <circle cx="45" cy="141" r="2.5" fill="#fb923c"/>
      <circle cx="75" cy="141" r="2.5" fill="#fb923c"/>
      <circle cx="80" cy="143" r="2.5" fill="#fb923c"/>
      <circle cx="85" cy="141" r="2.5" fill="#fb923c"/>
    </svg>
  )
}

function DogDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <ellipse cx="40" cy="58" rx="26" ry="18"/>
      <circle cx="40" cy="28" r="20"/>
      <ellipse cx="23" cy="15" rx="8" ry="14" transform="rotate(-15 23 15)"/>
      <ellipse cx="57" cy="15" rx="8" ry="14" transform="rotate(15 57 15)"/>
      <path d="M63 50 C77 38 79 22 67 13" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function BoneDeco({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <rect x="16" y="12" width="68" height="12" rx="6"/>
      <circle cx="16" cy="10" r="10"/>
      <circle cx="16" cy="26" r="10"/>
      <circle cx="84" cy="10" r="10"/>
      <circle cx="84" cy="26" r="10"/>
    </svg>
  )
}

function PawPrint({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <ellipse cx="13" cy="14" rx="6.5" ry="8"/>
      <ellipse cx="27" cy="8" rx="6.5" ry="8"/>
      <ellipse cx="41" cy="14" rx="6.5" ry="8"/>
      <ellipse cx="7" cy="28" rx="5.5" ry="7"/>
      <path d="M10 43 C8 30 16 24 26 24 C36 24 44 30 42 43 C40 53 33 56 26 56 C19 56 12 53 10 43Z"/>
    </svg>
  )
}

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

export default async function Home() {
  let userEmail: string | null = null
  let nombreDisplay: string | null = null
  let usuarioLogueado = false
  let esFundacion = false
  let nombreFundacion = ''
  let userId: string | null = null
  let perritos: PerritoReal[] = []
  let fundaciones: Fundacion[] = []
  let favoritosArr: string[] = []
  let solicitudesCount = 0

  try {
    const supabase = await createClient()

    const [{ data: { user } }, perritosRes, fundacionesRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('perritos')
        .select('*, perfiles_fundacion(nombre_fundacion, enlace_donacion)')
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false }),
      supabase
        .from('perfiles_fundacion')
        .select('id, nombre_fundacion, ciudad, logo_url, verificado, descripcion, telefono')
        .order('created_at', { ascending: false }),
    ])

    userEmail = user?.email ?? null
    usuarioLogueado = !!user
    perritos = (perritosRes.data ?? []).map((p: Record<string, unknown>) => {
      const raw = Array.isArray(p.perfiles_fundacion)
        ? (p.perfiles_fundacion as Record<string, unknown>[])[0]
        : (p.perfiles_fundacion as Record<string, unknown> | null)
      return {
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
        perfiles_fundacion: raw
          ? {
              nombre_fundacion: String(raw.nombre_fundacion ?? ''),
              enlace_donacion: raw.enlace_donacion ? String(raw.enlace_donacion) : null,
            }
          : null,
      } satisfies PerritoReal
    })
    fundaciones = (fundacionesRes.data ?? []).map((f: Record<string, unknown>) => ({
      id: String(f.id),
      nombre_fundacion: String(f.nombre_fundacion ?? ''),
      ciudad: f.ciudad ? String(f.ciudad) : null,
      logo_url: f.logo_url ? String(f.logo_url) : null,
      verificado: Boolean(f.verificado),
      descripcion: f.descripcion ? String(f.descripcion) : null,
      telefono: f.telefono ? String(f.telefono) : null,
    }))

    if (user) {
      userId = user.id
      const [perfFundRes, favoritosRes, perfilUsuarioRes] = await Promise.all([
        supabase
          .from('perfiles_fundacion')
          .select('nombre_fundacion')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('favoritos')
          .select('perrito_id')
          .eq('usuario_id', user.id),
        supabase
          .from('perfiles_usuario')
          .select('nombre_completo')
          .eq('id', user.id)
          .maybeSingle(),
      ])

      if (perfFundRes.data) {
        esFundacion = true
        nombreFundacion = perfFundRes.data.nombre_fundacion
        nombreDisplay = perfFundRes.data.nombre_fundacion

        const { count } = await supabase
          .from('solicitudes')
          .select('id', { count: 'exact', head: true })
          .eq('fundacion_id', user.id)
          .eq('leida', false)
        solicitudesCount = count ?? 0
      } else if (perfilUsuarioRes.data?.nombre_completo) {
        nombreDisplay = perfilUsuarioRes.data.nombre_completo
      }

      favoritosArr = (favoritosRes.data ?? []).map(
        (f: { perrito_id: string }) => f.perrito_id
      )
    }
  } catch (e) {
    console.error('[Home] Error cargando datos:', e)
  }

  // For foundation users show only their own dogs
  const perritosParaMostrar = esFundacion && userId
    ? perritos.filter((p) => p.fundacion_id === userId)
    : perritos

  const perritosFavoritos = perritos.filter((p) => favoritosArr.includes(p.id))

  return (
    <div className="min-h-screen bg-orange-50 font-sans">
      <Header userEmail={userEmail} nombreDisplay={nombreDisplay} esFundacion={esFundacion} />
      <HeroSection />
      <StatsSection />
      {esFundacion && <PanelFundacion nombre={nombreFundacion} solicitudesCount={solicitudesCount} />}
      {!esFundacion && <FundacionesSection fundaciones={fundaciones} />}
      {usuarioLogueado && perritosFavoritos.length > 0 && (
        <MisFavoritosSection perritos={perritosFavoritos} favoritosArr={favoritosArr} />
      )}
      <DogsSection perritos={perritosParaMostrar} favoritosArr={favoritosArr} usuarioLogueado={usuarioLogueado} esFundacion={esFundacion} />
      <Footer />
    </div>
  )
}

// ── HEADER ──────────────────────────────────────────────────

function Header({
  userEmail,
  nombreDisplay,
  esFundacion,
}: {
  userEmail: string | null
  nombreDisplay: string | null
  esFundacion: boolean
}) {
  const perfilHref = esFundacion ? '/fundacion/perfil' : '/perfil'
  const label = nombreDisplay || userEmail

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-3xl leading-none" aria-hidden="true">🐾</span>
          <span className="text-4xl font-bold leading-none bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm tracking-wide">
            Patitas
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <a
            href="#adoptar"
            className="text-sm text-stone-600 font-medium hidden sm:block hover:text-orange-500 transition-colors"
          >
            Adoptar
          </a>
          {userEmail ? (
            <>
              {/* Perfil: inicial en móvil, nombre en desktop */}
              <Link
                href={perfilHref}
                className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm hover:bg-orange-200 transition-colors flex-shrink-0"
                title="Mi perfil"
              >
                {(label ?? '?').charAt(0).toUpperCase()}
              </Link>
              <Link
                href={perfilHref}
                className="text-xs text-stone-500 font-medium hidden sm:block truncate max-w-28 hover:text-orange-500 transition-colors"
                title="Mi perfil"
              >
                {label}
              </Link>
              <Link
                href="/mis-conversaciones"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors text-base"
                aria-label="Mis conversaciones"
                title="Mis conversaciones"
              >
                💬
              </Link>
              <form action="/api/logout" method="POST">
                <button className="text-sm text-stone-500 hover:text-orange-500 font-medium transition-colors cursor-pointer">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="hidden sm:block text-sm text-stone-600 font-medium hover:text-orange-500 transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

// ── HERO ────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 px-4 pt-14 pb-20 text-white text-center">
      <div className="relative z-10 max-w-sm mx-auto">
        <div className="text-7xl mb-5">🐾</div>
        <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-2">
          Una comunidad que trabaja por el bienestar animal
        </p>
        <h1 className="text-3xl font-extrabold leading-tight mb-3 tracking-tight">
          Conectamos animales<br />con humanos
        </h1>
        <p className="text-orange-100 text-sm leading-relaxed mb-8">
          Cientos de perritos rescatados esperan un hogar lleno de amor.{' '}
          <strong className="text-white">Adopta, no compres.</strong>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="#adoptar"
            className="bg-white text-orange-500 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm"
          >
            Ver perritos 🐶
          </a>
          <a
            href="#fundaciones"
            className="bg-white/20 text-white font-semibold px-6 py-3 rounded-full border border-white/40 hover:bg-white/30 transition-colors text-sm"
          >
            Conocer fundaciones
          </a>
        </div>
      </div>
      <span className="absolute top-5 right-6 text-4xl opacity-25 select-none bone-sway" aria-hidden="true">🦴</span>
      <span className="absolute bottom-6 left-5 text-4xl opacity-25 select-none paw-float" aria-hidden="true">🐾</span>
      <span className="absolute top-14 left-10 text-2xl opacity-15 select-none paw-float-slow" aria-hidden="true">🐾</span>
      <span className="absolute top-8 left-1/3 text-xl opacity-10 select-none paw-float-delay" aria-hidden="true">🦴</span>
      <span className="absolute bottom-12 right-12 text-3xl opacity-20 select-none bone-sway-fast" aria-hidden="true">🐾</span>
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full" />
    </section>
  )
}

// ── STATS ───────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="px-4 -mt-6 relative z-10">
      <div className="bg-white max-w-sm mx-auto rounded-2xl shadow-md border border-orange-100 px-6 pt-5 pb-3">
        <div className="grid grid-cols-3 divide-x divide-orange-100">
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold text-orange-500">+230</div>
            <div className="text-xs text-stone-400 mt-0.5 leading-tight">Rescatados</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold text-orange-500">180+</div>
            <div className="text-xs text-stone-400 mt-0.5 leading-tight">Adoptados</div>
          </div>
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold text-orange-500">50+</div>
            <div className="text-xs text-stone-400 mt-0.5 leading-tight">En busca de hogar</div>
          </div>
        </div>
        {/* Dog mascot */}
        <div className="flex justify-center -mb-1 mt-1 select-none pointer-events-none">
          <div className="w-28 paw-float-slow drop-shadow-sm">
            <DogIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── PANEL FUNDACIÓN (solo para usuarios fundación) ───────────

function PanelFundacion({
  nombre,
  solicitudesCount,
}: {
  nombre: string
  solicitudesCount: number
}) {
  return (
    <section className="px-4 pt-8 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-5 shadow-md text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1">
          Panel de fundación
        </p>
        <h2 className="text-base font-extrabold mb-4 truncate">{nombre}</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/fundacion/nuevo-perrito"
            className="flex-1 flex items-center justify-center gap-2 bg-white text-orange-600 font-bold text-sm py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
          >
            🐾 Publicar un perrito
          </Link>
          <Link
            href="/fundacion/solicitudes"
            className="flex-1 relative flex items-center justify-center gap-2 bg-white/20 text-white font-bold text-sm py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
          >
            💌 Solicitudes
            {solicitudesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-stone-800 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {solicitudesCount > 99 ? '99+' : solicitudesCount}
              </span>
            )}
          </Link>
          <Link
            href="/fundacion/mis-perritos"
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white font-bold text-sm py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
          >
            📋 Mis perritos
          </Link>
          <Link
            href="/fundacion/perfil"
            className="flex items-center justify-center bg-white/10 text-white font-bold text-sm py-3 px-4 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
          >
            ✏️
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── FUNDACIONES ─────────────────────────────────────────────

function FundacionesSection({ fundaciones }: { fundaciones: Fundacion[] }) {
  return (
    <section id="fundaciones" className="pt-8 pb-2 max-w-2xl mx-auto">
      <div className="px-4 mb-4">
        <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
          Fundaciones aliadas 🏢
          <span className="paw-float inline-block text-orange-300 text-sm" aria-hidden="true">🐾</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Organizaciones que rescatan y cuidan perritos en Colombia
        </p>
      </div>
      <BuscarFundaciones fundaciones={fundaciones} />
    </section>
  )
}

// ── MIS FAVORITOS ────────────────────────────────────────────

function MisFavoritosSection({
  perritos,
  favoritosArr,
}: {
  perritos: PerritoReal[]
  favoritosArr: string[]
}) {
  return (
    <section className="pt-8 pb-2 max-w-2xl mx-auto">
      <div className="px-4 mb-4">
        <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
          Mis favoritos ❤️
          <span className="paw-float-slow inline-block text-rose-300 text-sm" aria-hidden="true">🐾</span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">Perritos que guardaste para volver a ver</p>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none]">
        {perritos.map((perrito) => {
          const colorIdx = perrito.nombre.charCodeAt(0) % BG_CLASES.length
          const bgClass = BG_CLASES[colorIdx]
          return (
            <div
              key={perrito.id}
              className="flex-shrink-0 w-32 bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm"
            >
              <div className={`bg-gradient-to-br ${bgClass} h-24 flex items-center justify-center relative overflow-hidden`}>
                {perrito.foto_url ? (
                  <img src={perrito.foto_url} alt={perrito.nombre} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl">🐶</span>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-bold text-stone-800 truncate">{perrito.nombre}</p>
                {perrito.raza && (
                  <p className="text-[10px] text-stone-400 truncate">{perrito.raza}</p>
                )}
                <FavoritoButton
                  perritoId={perrito.id}
                  esFavorito={favoritosArr.includes(perrito.id)}
                  usuarioLogueado={true}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── PERRITOS ────────────────────────────────────────────────

function DogsSection({
  perritos,
  favoritosArr,
  usuarioLogueado,
  esFundacion,
}: {
  perritos: PerritoReal[]
  favoritosArr: string[]
  usuarioLogueado: boolean
  esFundacion: boolean
}) {
  return (
    <section id="adoptar" className="px-4 py-10 relative overflow-hidden">
      {/* Static cream-area decorations */}
      <DogDoodle className="absolute top-6 right-2 w-20 text-orange-200 opacity-60 rotate-12 select-none pointer-events-none" />
      <DogDoodle className="absolute bottom-20 left-1 w-16 text-orange-200 opacity-50 -rotate-6 select-none pointer-events-none" />
      <DogDoodle className="absolute top-1/2 right-4 w-12 text-rose-200 opacity-40 rotate-6 select-none pointer-events-none" />
      <PawPrint className="absolute top-16 left-5 w-7 text-orange-300 opacity-40 select-none pointer-events-none rotate-[-20deg]" />
      <PawPrint className="absolute top-36 right-8 w-5 text-orange-300 opacity-35 select-none pointer-events-none rotate-[15deg]" />
      <PawPrint className="absolute top-64 left-3 w-6 text-rose-300 opacity-30 select-none pointer-events-none rotate-[-10deg]" />
      <PawPrint className="absolute bottom-40 right-3 w-7 text-orange-300 opacity-35 select-none pointer-events-none rotate-[25deg]" />
      <PawPrint className="absolute bottom-10 left-8 w-5 text-orange-200 opacity-40 select-none pointer-events-none rotate-[-5deg]" />
      <div className="max-w-2xl mx-auto relative z-10">
        <h2 className="text-xl font-bold text-stone-800 mb-1 flex items-center gap-2">
          {esFundacion ? 'Mis perritos publicados 🐶' : 'Perritos en adopción 🐶'}
          <span className="bone-sway inline-block text-orange-300 text-base" aria-hidden="true">🦴</span>
        </h2>
        <p className="text-sm text-stone-400 mb-4">
          {esFundacion
            ? 'Perritos que tu fundación tiene actualmente disponibles'
            : 'Todos vacunados, desparasitados y con seguimiento veterinario'}
        </p>

        {perritos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <p className="font-semibold text-stone-500 mb-1">Aún no hay perritos publicados</p>
            <p className="text-sm text-stone-400">
              Las fundaciones registradas pronto publicarán a sus perritos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {perritos.map((perrito) => (
              <PerritoCard
                key={perrito.id}
                perrito={perrito}
                esFavorito={favoritosArr.includes(perrito.id)}
                usuarioLogueado={usuarioLogueado}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PerritoCard({
  perrito,
  esFavorito,
  usuarioLogueado,
}: {
  perrito: PerritoReal
  esFavorito: boolean
  usuarioLogueado: boolean
}) {
  const colorIdx = perrito.nombre.charCodeAt(0) % BG_CLASES.length
  const bgClass = BG_CLASES[colorIdx]

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-br ${bgClass} h-52 flex items-center justify-center relative overflow-hidden`}>
        {perrito.foto_url ? (
          <img
            src={perrito.foto_url}
            alt={perrito.nombre}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-6xl" role="img" aria-label={perrito.nombre}>🐶</span>
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
          {perrito.tags.map((tag) => (
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

        {perrito.perfiles_fundacion && (
          <p className="text-[10px] text-stone-400 mb-3">
            🏢 {perrito.perfiles_fundacion.nombre_fundacion}
          </p>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <AdoptButton
              dogName={perrito.nombre}
              perritoId={perrito.id}
              fundacionId={perrito.fundacion_id}
              usuarioLogueado={usuarioLogueado}
              enlaceDonacion={perrito.perfiles_fundacion?.enlace_donacion ?? undefined}
            />
          </div>
          <FavoritoButton
            perritoId={perrito.id}
            esFavorito={esFavorito}
            usuarioLogueado={usuarioLogueado}
          />
        </div>
      </div>
    </article>
  )
}

// ── FOOTER ──────────────────────────────────────────────────

function Footer() {
  return (
    <footer id="contacto" className="bg-stone-800 text-white px-4 py-10 mt-4">
      <div className="max-w-sm mx-auto text-center">
        <div className="text-4xl mb-1" aria-hidden="true">🐾</div>
        <div className="text-2xl mb-2" aria-hidden="true">🇨🇴</div>
        <div className="text-xl font-bold mb-1">Patitas Colombia</div>
        <div className="text-stone-400 text-xs mb-1 uppercase tracking-wider font-semibold">
          Una comunidad que trabaja por el bienestar animal
        </div>
        <div className="text-stone-500 text-sm mb-6">
          Conectamos animales con humanos
        </div>

        {/* Bone decoration above contact */}
        <div className="flex justify-center mb-4 select-none pointer-events-none">
          <BoneDeco className="w-20 text-stone-600 bone-sway" />
        </div>

        <div className="relative">
          {/* Paw prints flanking the contact block */}
          <PawPrint className="absolute -left-1 top-0 w-6 text-stone-600 opacity-40 paw-float-slow select-none pointer-events-none" />
          <PawPrint className="absolute -right-1 bottom-0 w-5 text-stone-600 opacity-40 paw-float-delay select-none pointer-events-none" />
          <PawPrint className="absolute -left-2 bottom-2 w-4 text-stone-600 opacity-30 bone-sway-fast select-none pointer-events-none" />

          <div className="flex flex-col gap-2 text-sm text-stone-300 mb-6">
            <div>
              📧{' '}
              <a
                href="mailto:contacto@patitasapp.org"
                className="hover:text-orange-400 transition-colors"
              >
                contacto@patitasapp.org
              </a>
            </div>
            <div>
              📱{' '}
              <a
                href="https://wa.me/573202846863"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-400 transition-colors"
              >
                +57 320 284 6863
              </a>
            </div>
            <div>📍 Bogotá D.C., Colombia</div>
          </div>
        </div>

        {/* Paw prints below contact */}
        <div className="flex justify-center gap-4 mb-4 select-none pointer-events-none">
          <PawPrint className="w-5 text-stone-600 opacity-50 paw-float" />
          <BoneDeco className="w-12 text-stone-600 opacity-40 bone-sway-fast" />
          <PawPrint className="w-5 text-stone-600 opacity-50 paw-float-slow" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs text-stone-400 border-t border-stone-700 pt-6 mb-4">
          <div className="text-center">
            <div className="font-semibold text-stone-200 mb-0.5">Adoptantes</div>
            <a href="/registro" className="hover:text-orange-400 transition-colors">
              Crear cuenta
            </a>
          </div>
          <div className="text-center">
            <div className="font-semibold text-stone-200 mb-0.5">Fundaciones</div>
            <a href="/registro" className="hover:text-orange-400 transition-colors">
              Registrar ONG
            </a>
          </div>
          <div className="text-center">
            <div className="font-semibold text-stone-200 mb-0.5">Ayuda</div>
            <a
              href="mailto:contacto@patitasapp.org"
              className="hover:text-orange-400 transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>

        <div className="text-xs text-stone-500">
          © 2025 Patitas Colombia · Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
