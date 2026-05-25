import type { Metadata } from 'next'
import RegistroClient from './RegistroClient'

export const metadata: Metadata = {
  title: 'Crear cuenta — Patitas',
  description: 'Únete a Patitas como fundación de rescate o como voluntario y adoptante.',
}

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex flex-col items-center justify-start py-10 px-4 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-10 left-5 text-6xl opacity-[0.08] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-20 right-5 text-5xl opacity-[0.08] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute top-2/5 right-3 text-4xl opacity-[0.06] paw-float-delay" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-1/2 left-2 text-3xl opacity-[0.07] bone-sway-fast" aria-hidden="true">🦴</span>
      <a href="/" className="flex items-center gap-2 mb-8 group">
        <span className="text-2xl">🐾</span>
        <span className="text-lg font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
          Patitas
        </span>
      </a>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <RegistroClient />
      </div>
      <p className="mt-6 text-xs text-stone-400 text-center">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-orange-500 font-medium hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  )
}
