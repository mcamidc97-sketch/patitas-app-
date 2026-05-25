'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { guardarPerfilFundacion } from '@/app/actions/perfil'

type Perfil = {
  nombre_fundacion: string
  nit: string
  descripcion: string | null
  ciudad: string | null
  departamento: string | null
  telefono: string | null
  enlace_donacion: string | null
  logo_url: string | null
}

export default function FormPerfilFundacion({
  perfil,
  userId,
}: {
  perfil: Perfil
  userId: string
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [descripcion, setDescripcion] = useState(perfil.descripcion ?? '')
  const [ciudad, setCiudad] = useState(perfil.ciudad ?? '')
  const [departamento, setDepartamento] = useState(perfil.departamento ?? '')
  const [telefono, setTelefono] = useState(perfil.telefono ?? '')
  const [enlaceDonacion, setEnlaceDonacion] = useState(perfil.enlace_donacion ?? '')
  const [logoUrl, setLogoUrl] = useState<string | null>(perfil.logo_url)
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const iniciales = perfil.nombre_fundacion
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    setMensaje(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/logo.${ext}`
      const { error } = await supabase.storage
        .from('fotos-perfil')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
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
      const res = await guardarPerfilFundacion({
        descripcion,
        ciudad,
        departamento,
        telefono,
        enlace_donacion: enlaceDonacion,
        logo_url: logoUrl,
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
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={subiendo}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-4 border-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-orange-500">{iniciales}</span>
          )}
          <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[10px] text-center py-1 font-medium">
            {subiendo ? 'Subiendo…' : 'Cambiar'}
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        <p className="text-xs text-stone-400">Logo de la fundación</p>
      </div>

      {/* Nombre (solo lectura) */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">
          Nombre de la fundación
        </label>
        <p className="text-sm font-bold text-stone-700 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5">
          {perfil.nombre_fundacion}
        </p>
        <p className="text-[10px] text-stone-400 mt-1">Para cambiar el nombre contáctanos</p>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">
          Descripción de la fundación
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          placeholder="Cuéntanos sobre la fundación, su misión y cómo trabajan…"
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
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

      {/* Enlace donación */}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">
          Enlace de donación
        </label>
        <input
          type="url"
          value={enlaceDonacion}
          onChange={(e) => setEnlaceDonacion(e.target.value)}
          placeholder="https://wompi.co/…"
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <p className="text-[10px] text-stone-400 mt-1">Wompi u otra plataforma de pagos</p>
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
