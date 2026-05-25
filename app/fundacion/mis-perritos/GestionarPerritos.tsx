'use client'

import { useState } from 'react'
import { marcarAdoptado, eliminarPerrito } from '@/app/actions/perritos'
import { useRouter } from 'next/navigation'

type Perrito = {
  id: string
  nombre: string
  raza: string | null
  edad: string
  estado: string
  foto_url: string | null
  created_at: string
}

const ESTADO_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptado: 'Adoptado',
}

const ESTADO_COLOR: Record<string, string> = {
  disponible: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  en_proceso: 'bg-amber-50 text-amber-600 border-amber-100',
  adoptado: 'bg-sky-50 text-sky-600 border-sky-100',
}

export default function GestionarPerritos({ perritos: inicial }: { perritos: Perrito[] }) {
  const router = useRouter()
  const [perritos, setPerritos] = useState(inicial)
  const [cargando, setCargando] = useState<string | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)

  async function handleAdoptado(id: string) {
    setCargando(id + '-adoptado')
    const res = await marcarAdoptado(id)
    if ('ok' in res) {
      setPerritos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: 'adoptado' } : p))
      )
      router.refresh()
    }
    setCargando(null)
  }

  async function handleEliminar(id: string) {
    setCargando(id + '-eliminar')
    const res = await eliminarPerrito(id)
    if ('ok' in res) {
      setPerritos((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    }
    setCargando(null)
    setConfirmEliminar(null)
  }

  if (perritos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🐾</div>
        <p className="font-semibold text-stone-500 mb-1">Aún no has publicado perritos</p>
        <a
          href="/fundacion/nuevo-perrito"
          className="inline-block mt-4 bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm"
        >
          Publicar primer perrito
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {perritos.map((perrito) => {
        const esAdoptado = perrito.estado === 'adoptado'
        return (
          <div
            key={perrito.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
              esAdoptado ? 'border-stone-100 opacity-70' : 'border-orange-100'
            }`}
          >
            <div className="flex gap-3 p-4">
              {/* Foto */}
              <div className="w-16 h-16 rounded-xl bg-orange-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {perrito.foto_url ? (
                  <img
                    src={perrito.foto_url}
                    alt={perrito.nombre}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl">🐶</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{perrito.nombre}</p>
                    {perrito.raza && (
                      <p className="text-xs text-stone-400">{perrito.raza}</p>
                    )}
                    <p className="text-xs text-stone-400 mt-0.5">{perrito.edad}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      ESTADO_COLOR[perrito.estado] ?? 'bg-stone-50 text-stone-500 border-stone-100'
                    }`}
                  >
                    {ESTADO_LABEL[perrito.estado] ?? perrito.estado}
                  </span>
                </div>

                {/* Botones */}
                <div className="flex gap-2 mt-3">
                  {!esAdoptado && (
                    <button
                      onClick={() => handleAdoptado(perrito.id)}
                      disabled={cargando === perrito.id + '-adoptado'}
                      className="flex-1 text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100 py-2 rounded-lg hover:bg-sky-100 transition-colors disabled:opacity-50"
                    >
                      {cargando === perrito.id + '-adoptado' ? 'Guardando…' : '🏠 Marcar adoptado'}
                    </button>
                  )}

                  {confirmEliminar === perrito.id ? (
                    <>
                      <button
                        onClick={() => handleEliminar(perrito.id)}
                        disabled={cargando === perrito.id + '-eliminar'}
                        className="flex-1 text-xs font-semibold bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {cargando === perrito.id + '-eliminar' ? 'Eliminando…' : '¿Confirmar?'}
                      </button>
                      <button
                        onClick={() => setConfirmEliminar(null)}
                        className="text-xs text-stone-400 px-3 py-2 rounded-lg hover:bg-stone-50"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmEliminar(perrito.id)}
                      className="text-xs font-semibold bg-stone-50 text-stone-500 border border-stone-100 py-2 px-3 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
