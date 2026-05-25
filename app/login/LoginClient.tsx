'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { iniciarSesion } from '@/app/actions/auth'

function BtnEnvio() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
    >
      {pending ? 'Ingresando...' : 'Iniciar sesión'}
    </button>
  )
}

const inputCls = (error?: boolean) =>
  `w-full border ${error ? 'border-red-400 bg-red-50' : 'border-stone-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white`

export default function LoginClient() {
  const [state, action] = useActionState(iniciarSesion, {})

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <div className="text-4xl mb-3">🐾</div>
        <h1 className="text-xl font-bold text-stone-800 mb-1">¡Bienvenido de nuevo!</h1>
        <p className="text-sm text-stone-400">Ingresa a tu cuenta Patitas</p>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className={inputCls(state.campoError === 'email')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputCls(state.campoError === 'password')}
        />
      </div>

      <BtnEnvio />

      <div className="text-center">
        <Link
          href="/registro"
          className="text-xs text-stone-400 hover:text-orange-500 transition-colors"
        >
          ¿No tienes cuenta?{' '}
          <span className="text-orange-500 font-medium">Regístrate</span>
        </Link>
      </div>
    </form>
  )
}
