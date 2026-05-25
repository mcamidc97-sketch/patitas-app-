'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { guardarPerfilUsuario } from '@/app/actions/perfil'

type Perfil = {
  nombre_completo: string
  telefono: string | null
  ciudad: string | null
  departamento: string | null
  tipo_usuario: string
  descripcion: string | null
  foto_url: string | null
}

const TIPO_OPCIONES = [
  { value: 'adoptante', label: '🐾 Apadrinador/a', desc: 'Me hago cargo de una mascota y la apoyo sin llevarla a casa' },
  { value: 'voluntario', label: '🤝 Voluntario/a', desc: 'Quiero ayudar en actividades de la fundación' },
  { value: 'ambos', label: '💛 Ambos', desc: 'Me interesa apadrinar y también hacer voluntariado' },
]

export default function FormPerfil({
  perfil,
  userId,
}: {
  perfil: Perfil
  userId: string
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nombreCompleto, setNombreCompleto] = useState(perfil.nombre_completo ?? '')
  const [telefono, setTelefono] = useState(perfil.telefono ?? '')
  const [ciudad, setCiudad] = useState(perfil.ciudad ?? '')
  const [departamento, setDepartamento] = useState(perfil.departamento ?? '')
  const [tipoUsuario, setTipoUsuario] = useState(perfil.tipo_usuario ?? 'adoptante')
  const [descripcion, setDescripcion] = useState(perfil.descripcion ?? '')
  const [fotoUrl, setFotoUrl] = useState<string | null>(perfil.foto_url)
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const iniciales = nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    setMensaje(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`
      const { error } = await supabase.storage
        .from('fotos-perfil')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path)
      setFotoUrl(data.publicUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir imagen'
      setMensaje({ tipo: 'error', texto: msg })
    } finally {
      setSubiendo(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)
    try {
      const res = await guardarPerfilUsuario({
        nombre_completo: nombreCompleto,
        telefono,
        ciudad,
        departamento,
        tipo_usuario: tipoUsuario,
        descripcion,
        foto_url: fotoUrl,
      })
      if ('error' in res) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error desconocido' })
      } else {
        setMensaje({ tipo: 'ok', texto: '¡Perfil actualizado correctamente!' })
        router.refresh()
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Foto de perfil */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={subiendo}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-4 border-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
        >
          {fotoUrl ? (
            <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-orange-500">{iniciales}</span>
          )}
          <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] text-center py-1 font-medium">
            {subiendo ? 'Subiendo…' : 'Cambiar'}
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        <p className="text-xs text-stone-400">Foto de perfil</p>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">Nombre completo</label>
        <input
          type="text"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          placeholder="Tu nombre"
          required
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Sobre mí */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">Sobre mí</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          placeholder="Cuéntanos un poco sobre ti: por qué quieres hacer voluntariado, experiencia con animales, disponibilidad…"
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <p className="text-[10px] text-stone-400 mt-1">
          Las fundaciones podrán ver esta descripción al contactarte para voluntariados.
        </p>
      </div>

      {/* Tipo de usuario */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-2">Me interesa…</label>
        <div className="space-y-2">
          {TIPO_OPCIONES.map((op) => (
            <label
              key={op.value}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                tipoUsuario === op.value
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-stone-100 bg-white hover:border-orange-200'
              }`}
            >
              <input
                type="radio"
                name="tipo_usuario"
                value={op.value}
                checked={tipoUsuario === op.value}
                onChange={() => setTipoUsuario(op.value)}
                className="mt-0.5 accent-orange-500"
              />
              <div>
                <p className="text-sm font-semibold text-stone-700">{op.label}</p>
                <p className="text-xs text-stone-400">{op.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Ciudad y Departamento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1">Ciudad</label>
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Bogotá"
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1">Departamento</label>
          <input
            type="text"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            placeholder="Cundinamarca"
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">
          Teléfono de contacto
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+57 300 000 0000"
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {mensaje && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}
        >
          {mensaje.tipo === 'ok' ? '✓ ' : '✗ '}
          {mensaje.texto}
        </div>
      )}

      <button
        type="submit"
        disabled={guardando || subiendo}
        className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {guardando ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
