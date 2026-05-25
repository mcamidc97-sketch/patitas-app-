'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function FiltroCiudad({ ciudades, seleccionada }: { ciudades: string[]; seleccionada: string }) {
  const router = useRouter()
  const params = useSearchParams()

  function seleccionar(ciudad: string) {
    const p = new URLSearchParams(params.toString())
    if (ciudad) {
      p.set('ciudad', ciudad)
    } else {
      p.delete('ciudad')
    }
    router.push(`/?${p.toString()}`, { scroll: false })
  }

  if (ciudades.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] mb-6">
      <button
        onClick={() => seleccionar('')}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
          !seleccionada
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-stone-500 border-stone-200 hover:border-orange-300'
        }`}
      >
        Todas
      </button>
      {ciudades.map((c) => (
        <button
          key={c}
          onClick={() => seleccionar(c)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
            seleccionada === c
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-stone-500 border-stone-200 hover:border-orange-300'
          }`}
        >
          📍 {c}
        </button>
      ))}
    </div>
  )
}
