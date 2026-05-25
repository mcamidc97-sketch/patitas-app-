'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { marcarSolicitudesLeidas } from '@/app/actions/solicitudes'

export default function SolicitudesButton({ count }: { count: number }) {
  const [displayCount, setDisplayCount] = useState(count)
  const router = useRouter()

  async function handleClick() {
    setDisplayCount(0)
    await marcarSolicitudesLeidas()
    router.push('/fundacion/solicitudes')
  }

  return (
    <button
      onClick={handleClick}
      className="flex-1 relative flex items-center justify-center gap-2 bg-white/20 text-white font-bold text-sm py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30 cursor-pointer"
    >
      💌 Solicitudes
      {displayCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-stone-800 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow">
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  )
}
