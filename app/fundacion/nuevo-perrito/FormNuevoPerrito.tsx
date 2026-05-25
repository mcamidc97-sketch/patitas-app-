'use client'

import { useActionState, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { guardarPerrito, type PerritoState } from '@/app/actions/perritos'
import { createClient } from '@/lib/supabase/client'

const TAGS_DISPONIBLES = [
  'Juguetón/a', 'Cariñoso/a', 'Tranquilo/a', 'Activo/a',
  'Sociable', 'Inteligente', 'Curioso/a', 'Leal',
  'Protector/a', 'Casero/a', 'Aventurero/a', 'Elegante',
  'Amistoso/a', 'Energético/a',
]

const TAMANOS = [
  { value: 'pequeño', label: 'Pequeño', emoji: '🐩', sub: '< 10 kg' },
  { value: 'mediano', label: 'Mediano', emoji: '🐕', sub: '10–25 kg' },
  { value: 'grande',  label: 'Grande',  emoji: '🦮', sub: '> 25 kg'  },
]

const ESTADOS = [
  { value: 'disponible', label: 'Disponible', icon: '🟢', activo: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { value: 'en_proceso', label: 'En proceso', icon: '🟡', activo: 'border-amber-400  bg-amber-50  text-amber-700'   },
  { value: 'adoptado',   label: 'Adoptado',   icon: '⚫',  activo: 'border-stone-400  bg-stone-100 text-stone-700'   },
]

function SeccionHeader({ emoji, texto }: { emoji: string; texto: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{emoji}</span>
      <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">{texto}</span>
    </div>
  )
}

function BtnPublicar() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-2xl text-base transition-colors cursor-pointer shadow-sm"
    >
      {pending ? '⏳ Publicando...' : '🐾 Publicar perrito'}
    </button>
  )
}

export default function FormNuevoPerrito() {
  const [state, action] = useActionState<PerritoState, FormData>(guardarPerrito, {})
  const [preview, setPreview]       = useState<string | null>(null)
  const [fotoUrl, setFotoUrl]       = useState('')
  const [subiendo, setSubiendo]     = useState(false)
  const [tamaño, setTamaño]         = useState('')
  const [vacunado, setVacunado]     = useState(false)
  const [esterilizado, setEsteril]  = useState(false)
  const [tags, setTags]             = useState<Set<string>>(new Set())
  const [estado, setEstado]         = useState('disponible')
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleTag(tag: string) {
    setTags(prev => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview inmediato
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Subir a Supabase Storage desde el browser (evita el límite 1 MB del Server Action)
    setSubiendo(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `perritos/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('fotos-perritos')
        .upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('fotos-perritos').getPublicUrl(path)
        setFotoUrl(data.publicUrl)
      }
    } finally {
      setSubiendo(false)
    }
  }

  if (state.exito) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-stone-800 mb-2">
          ¡{state.perritoNombre} está publicado!
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed mb-8">
          Su perfil ya es visible para los adoptantes. Pronto recibirás solicitudes.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-orange-600 transition-colors cursor-pointer"
          >
            + Publicar otro perrito
          </button>
          <Link
            href="/"
            className="w-full text-center bg-stone-100 text-stone-700 font-semibold py-3 rounded-xl text-sm hover:bg-stone-200 transition-colors"
          >
            Ver inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-7">
      {/* Inputs ocultos para estado controlado */}
      <input type="hidden" name="tamaño"      value={tamaño} />
      <input type="hidden" name="vacunado"    value={vacunado.toString()} />
      <input type="hidden" name="esterilizado" value={esterilizado.toString()} />
      <input type="hidden" name="estado"      value={estado} />
      <input type="hidden" name="foto_url"    value={fotoUrl} />
      {Array.from(tags).map(tag => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      {/* ── FOTO ── */}
      <div>
        <SeccionHeader emoji="📸" texto="Foto principal" />
        <label htmlFor="foto-input" className="block cursor-pointer">
          <div
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${
              preview
                ? 'border-transparent'
                : 'border-dashed border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors'
            } flex items-center justify-center`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-4">
                  <span className="bg-white/90 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    {subiendo ? '⏳ Subiendo...' : '📷 Cambiar foto'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10">
                <span className="text-6xl">🐶</span>
                <span className="text-sm font-bold text-orange-500">Toca para añadir foto</span>
                <span className="text-xs text-stone-400">JPG, PNG, WEBP · Máx. 5 MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            id="foto-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFoto}
          />
        </label>
      </div>

      {/* ── INFO BÁSICA ── */}
      <div>
        <SeccionHeader emoji="📋" texto="Información básica" />
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
              Nombre *
            </label>
            <input
              name="nombre"
              type="text"
              required
              placeholder="Ej: Luna, Max, Coco..."
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Raza</label>
              <input
                name="raza"
                type="text"
                placeholder="Ej: Labrador Mix"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Edad *</label>
              <input
                name="edad"
                type="text"
                required
                placeholder="Ej: 2 años"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Tamaño</label>
            <div className="grid grid-cols-3 gap-2">
              {TAMANOS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTamaño(t.value === tamaño ? '' : t.value)}
                  className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all cursor-pointer ${
                    tamaño === t.value
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-stone-200 text-stone-500 hover:border-orange-200'
                  }`}
                >
                  <span className="text-2xl mb-1">{t.emoji}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className="text-[10px] text-stone-400">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SALUD ── */}
      <div>
        <SeccionHeader emoji="💉" texto="Salud y cuidados" />
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVacunado(v => !v)}
            className={`flex flex-col items-center gap-1.5 py-5 rounded-2xl border-2 transition-all cursor-pointer ${
              vacunado
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : 'border-stone-200 text-stone-400 hover:border-emerald-200'
            }`}
          >
            <span className="text-3xl">{vacunado ? '✅' : '💊'}</span>
            <span className="text-xs font-bold">Vacunado/a</span>
            <span className={`text-[10px] font-medium ${vacunado ? 'text-emerald-500' : 'text-stone-400'}`}>
              {vacunado ? 'Sí ✓' : 'Sin confirmar'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setEsteril(e => !e)}
            className={`flex flex-col items-center gap-1.5 py-5 rounded-2xl border-2 transition-all cursor-pointer ${
              esterilizado
                ? 'border-sky-400 bg-sky-50 text-sky-700'
                : 'border-stone-200 text-stone-400 hover:border-sky-200'
            }`}
          >
            <span className="text-3xl">{esterilizado ? '✅' : '🏥'}</span>
            <span className="text-xs font-bold">Esterilizado/a</span>
            <span className={`text-[10px] font-medium ${esterilizado ? 'text-sky-500' : 'text-stone-400'}`}>
              {esterilizado ? 'Sí ✓' : 'Sin confirmar'}
            </span>
          </button>
        </div>
      </div>

      {/* ── PERSONALIDAD ── */}
      <div>
        <SeccionHeader emoji="✨" texto="Personalidad" />
        <p className="text-xs text-stone-400 mb-3">Toca para seleccionar — puedes elegir varios</p>
        <div className="flex flex-wrap gap-2">
          {TAGS_DISPONIBLES.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer ${
                tags.has(tag)
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags.size > 0 && (
          <p className="text-xs text-rose-400 mt-2 font-medium">{tags.size} seleccionado{tags.size !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* ── DESCRIPCIÓN ── */}
      <div>
        <SeccionHeader emoji="📝" texto="Descripción" />
        <textarea
          name="descripcion"
          rows={4}
          placeholder="Cuéntanos sobre la personalidad de este perrito, su historia, lo que le gusta y qué tipo de familia busca..."
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white resize-none leading-relaxed"
        />
      </div>

      {/* ── ESTADO ── */}
      <div>
        <SeccionHeader emoji="🏠" texto="Estado de adopción" />
        <div className="grid grid-cols-3 gap-2">
          {ESTADOS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setEstado(s.value)}
              className={`py-3 rounded-xl text-[11px] font-bold border-2 transition-all cursor-pointer leading-tight ${
                estado === s.value ? s.activo : 'border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
            >
              <span className="block text-lg mb-0.5">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <BtnPublicar />
    </form>
  )
}
