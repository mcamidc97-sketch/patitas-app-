'use client'

import { useState } from 'react'
import Link from 'next/link'

type Fundacion = {
  id: string
  nombre_fundacion: string
  ciudad: string | null
  logo_url: string | null
  verificado: boolean
  descripcion: string | null
  telefono: string | null
}

export default function BuscarFundaciones({ fundaciones }: { fundaciones: Fundacion[] }) {
  const [busqueda, setBusqueda] = useState('')

  const filtradas = busqueda.trim()
    ? fundaciones.filter(
        (f) =>
          f.nombre_fundacion.toLowerCase().includes(busqueda.toLowerCase()) ||
          (f.ciudad && f.ciudad.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : fundaciones

  return (
    <div>
      <div className="px-4 mb-3">
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="px-4 text-sm text-stone-400 py-4">No se encontraron fundaciones</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none]">
          {filtradas.map((f) => {
            const iniciales = f.nombre_fundacion
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()

            return (
              <Link
                key={f.id}
                href={`/fundaciones/${f.id}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 bg-white rounded-2xl p-3 w-28 border border-orange-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                  {f.logo_url ? (
                    <img
                      src={f.logo_url}
                      alt={f.nombre_fundacion}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-extrabold text-orange-500">{iniciales}</span>
                  )}
                </div>
                {f.verificado && (
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full -mt-1">
                    ✓ Verificada
                  </span>
                )}
                <p className="text-[11px] font-semibold text-stone-700 text-center leading-tight line-clamp-2">
                  {f.nombre_fundacion}
                </p>
                {f.ciudad && (
                  <p className="text-[10px] text-stone-400 text-center">📍 {f.ciudad}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
