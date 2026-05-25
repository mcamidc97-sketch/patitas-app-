'use client'

import { useState } from 'react'
import { toggleFavorito } from '@/app/actions/favoritos'

export default function FavoritoButton({
  perritoId,
  esFavorito,
  usuarioLogueado,
}: {
  perritoId: string
  esFavorito: boolean
  usuarioLogueado: boolean
}) {
  const [activo, setActivo] = useState(esFavorito)
  const [cargando, setCargando] = useState(false)

  if (!usuarioLogueado) {
    return (
      <a
        href="/login"
        title="Inicia sesión para guardar favoritos"
        className="flex items-center justify-center w-11 h-11 rounded-xl border-2 border-stone-100 bg-stone-50 text-stone-300 hover:border-rose-200 hover:text-rose-300 transition-colors flex-shrink-0"
      >
        🤍
      </a>
    )
  }

  async function handleToggle() {
    if (cargando) return
    setCargando(true)
    const nuevoEstado = !activo
    setActivo(nuevoEstado)
    try {
      await toggleFavorito(perritoId, activo)
    } catch {
      setActivo(activo) // revertir si falla
    } finally {
      setCargando(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={cargando}
      title={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-all cursor-pointer flex-shrink-0 ${
        activo
          ? 'border-rose-300 bg-rose-50 scale-105'
          : 'border-stone-100 bg-stone-50 text-stone-300 hover:border-rose-200 hover:text-rose-400'
      }`}
    >
      {activo ? '❤️' : '🤍'}
    </button>
  )
}
