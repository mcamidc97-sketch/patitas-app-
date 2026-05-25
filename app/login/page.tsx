import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Patitas',
  description: 'Ingresa a tu cuenta de Patitas para adoptar o gestionar perritos.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex flex-col items-center justify-start py-10 px-4 font-sans relative overflow-x-hidden">
      <span className="pointer-events-none select-none absolute top-8 right-6 text-6xl opacity-[0.08] paw-float" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute bottom-24 left-4 text-5xl opacity-[0.08] bone-sway" aria-hidden="true">🦴</span>
      <span className="pointer-events-none select-none absolute top-1/2 left-3 text-4xl opacity-[0.06] paw-float-slow" aria-hidden="true">🐾</span>
      <span className="pointer-events-none select-none absolute top-1/3 right-4 text-3xl opacity-[0.07] bone-sway-fast" aria-hidden="true">🦴</span>
      <a href="/" className="flex items-center gap-2 mb-8 group">
        <span className="text-2xl">🐾</span>
        <span className="text-lg font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
          Patitas
        </span>
      </a>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <LoginClient />
      </div>
      <p className="mt-6 text-xs text-stone-400 text-center">
        ¿No tienes cuenta?{' '}
        <a href="/registro" className="text-orange-500 font-medium hover:underline">
          Regístrate gratis
        </a>
      </p>
    </div>
  )
}
