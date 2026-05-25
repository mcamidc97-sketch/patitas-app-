'use client'

import { useState } from 'react'
import { registrarInteres } from '@/app/actions/solicitudes'

type Tipo = 'adoptar' | 'apadrinar'

export default function AdoptButton({
  dogName,
  perritoId,
  fundacionId,
  usuarioLogueado,
  enlaceDonacion,
}: {
  dogName: string
  perritoId: string
  fundacionId: string
  usuarioLogueado: boolean
  enlaceDonacion?: string
}) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'enviado' | 'yaEnviado'>('idle')
  const [tipoCargando, setTipoCargando] = useState<Tipo | null>(null)

  async function handleClick(tipo: Tipo) {
    if (!usuarioLogueado) {
      window.location.href = '/login?from=adoptar'
      return
    }
    setEstado('cargando')
    setTipoCargando(tipo)
    const res = await registrarInteres(perritoId, fundacionId, tipo)
    if ('error' in res && res.error !== 'login') {
      setEstado('idle')
      setTipoCargando(null)
      return
    }
    setEstado('yaEnviado' in res && res.yaEnviado ? 'yaEnviado' : 'enviado')
    setTipoCargando(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {estado === 'enviado' ? (
        <div className="w-full text-center py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          ✅ ¡Notificamos a la fundación! Pronto te contactarán.
        </div>
      ) : estado === 'yaEnviado' ? (
        <div className="w-full text-center py-3 px-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-sm font-semibold">
          🐾 Ya enviaste tu interés en {dogName}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleClick('adoptar')}
            disabled={estado === 'cargando'}
            className="flex flex-col items-center justify-center gap-0.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-2 rounded-xl transition-colors text-xs cursor-pointer disabled:opacity-60"
          >
            <span className="text-base">🏠</span>
            {estado === 'cargando' && tipoCargando === 'adoptar' ? 'Enviando…' : 'Adoptar'}
          </button>
          <button
            onClick={() => handleClick('apadrinar')}
            disabled={estado === 'cargando'}
            className="flex flex-col items-center justify-center gap-0.5 bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 px-2 rounded-xl transition-colors text-xs cursor-pointer disabled:opacity-60"
          >
            <span className="text-base">🐾</span>
            {estado === 'cargando' && tipoCargando === 'apadrinar' ? 'Enviando…' : 'Apadrinar'}
          </button>
        </div>
      )}
      {!usuarioLogueado && (
        <p className="text-center text-[10px] text-stone-400">
          <a href="/login" className="underline hover:text-orange-500">Inicia sesión</a> para adoptar o apadrinar
        </p>
      )}
      {enlaceDonacion && (
        <a
          href={enlaceDonacion}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center border border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          💝 Donar a esta fundación
        </a>
      )}
    </div>
  )
}
