'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import {
  registrarFundacion,
  registrarUsuario,
  type AuthState,
} from '@/app/actions/auth'
import { formatearNIT } from '@/lib/validaciones/nit'

const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico',
  'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas',
  'Caquetá', 'Casanare', 'Cauca', 'Cesar',
  'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía',
  'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés y Providencia',
  'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
  'Vaupés', 'Vichada',
]

function BtnEnvio({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
    >
      {pending ? 'Procesando...' : label}
    </button>
  )
}

function Campo({
  label,
  error,
  children,
  hint,
}: {
  label: string
  error?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = (error?: boolean) =>
  `w-full border ${error ? 'border-red-400 bg-red-50' : 'border-stone-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white`

function Exito({ tipo }: { tipo: 'fundacion' | 'usuario' }) {
  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">¡Cuenta creada!</h3>
      <p className="text-stone-500 text-sm leading-relaxed mb-6">
        {tipo === 'fundacion'
          ? 'Revisa tu email para confirmar tu cuenta. Tu fundación estará activa una vez verificada por nuestro equipo.'
          : 'Revisa tu email para confirmar tu cuenta. ¡Bienvenido/a a la familia Patitas!'}
      </p>
      <Link
        href="/login"
        className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-orange-600 transition-colors"
      >
        Ir a iniciar sesión
      </Link>
    </div>
  )
}

function FormFundacion({ onVolver }: { onVolver: () => void }) {
  const [state, action] = useActionState(registrarFundacion, {})
  const [nit, setNit] = useState('')

  if (state.exito) return <Exito tipo="fundacion" />

  return (
    <form action={action} className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1 text-xs text-stone-400 hover:text-orange-500 transition-colors w-fit"
      >
        ← Cambiar tipo de cuenta
      </button>

      <div>
        <h2 className="text-base font-bold text-stone-800">Registro de Fundación 🏢</h2>
        <p className="text-xs text-stone-400">Para organizaciones de rescate y bienestar animal en Colombia</p>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <Campo label="Nombre de la fundación *">
        <input
          name="nombre_fundacion"
          type="text"
          required
          placeholder="Ej: Fundación Amor Animal Bogotá"
          className={inputCls(state.campoError === 'nombre_fundacion')}
        />
      </Campo>

      <Campo
        label="NIT *"
        hint="Formato: XXXXXXXXX-X — Se verificará con la DIAN"
      >
        <input
          name="nit"
          type="text"
          required
          value={nit}
          onChange={(e) => setNit(formatearNIT(e.target.value))}
          placeholder="900123456-7"
          maxLength={12}
          className={`${inputCls(state.campoError === 'nit')} font-mono tracking-wider`}
        />
      </Campo>

      <Campo label="Email corporativo *">
        <input
          name="email"
          type="email"
          required
          placeholder="contacto@mifundacion.org"
          className={inputCls(state.campoError === 'email')}
        />
      </Campo>

      <Campo label="Contraseña *" hint="Mínimo 8 caracteres">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          className={inputCls(state.campoError === 'password')}
        />
      </Campo>

      <Campo label="Teléfono">
        <input
          name="telefono"
          type="tel"
          placeholder="+57 310 123 4567"
          className={inputCls()}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Departamento">
          <select name="departamento" className={inputCls()}>
            <option value="">Seleccionar</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Ciudad">
          <input
            name="ciudad"
            type="text"
            placeholder="Ej: Medellín"
            className={inputCls()}
          />
        </Campo>
      </div>

      <Campo label="Descripción de la fundación">
        <textarea
          name="descripcion"
          rows={3}
          placeholder="Cuéntanos sobre tu misión, cuántos años llevan operando..."
          className={`${inputCls()} resize-none`}
        />
      </Campo>

      <BtnEnvio label="Crear cuenta de fundación 🐾" />
    </form>
  )
}

function FormUsuario({ onVolver }: { onVolver: () => void }) {
  const [state, action] = useActionState(registrarUsuario, {})

  if (state.exito) return <Exito tipo="usuario" />

  return (
    <form action={action} className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onVolver}
        className="flex items-center gap-1 text-xs text-stone-400 hover:text-orange-500 transition-colors w-fit"
      >
        ← Cambiar tipo de cuenta
      </button>

      <div>
        <h2 className="text-base font-bold text-stone-800">Registro de Voluntario / Adoptante 🙋</h2>
        <p className="text-xs text-stone-400">Para personas que quieren ayudar o encontrar su compañero perfecto</p>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <Campo label="Nombre completo *">
        <input
          name="nombre_completo"
          type="text"
          required
          placeholder="Ej: María García López"
          className={inputCls(state.campoError === 'nombre_completo')}
        />
      </Campo>

      <Campo label="Email *">
        <input
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          className={inputCls(state.campoError === 'email')}
        />
      </Campo>

      <Campo label="Contraseña *" hint="Mínimo 8 caracteres">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          className={inputCls(state.campoError === 'password')}
        />
      </Campo>

      <Campo label="Quiero...">
        <select name="tipo_usuario" className={inputCls()}>
          <option value="adoptante">🐶 Adoptar un perrito</option>
          <option value="voluntario">🤝 Ser voluntario</option>
          <option value="ambos">💛 Las dos opciones</option>
        </select>
      </Campo>

      <Campo label="Teléfono">
        <input
          name="telefono"
          type="tel"
          placeholder="+57 310 123 4567"
          className={inputCls()}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Departamento">
          <select name="departamento" className={inputCls()}>
            <option value="">Seleccionar</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Ciudad">
          <input
            name="ciudad"
            type="text"
            placeholder="Ej: Cali"
            className={inputCls()}
          />
        </Campo>
      </div>

      <BtnEnvio label="Unirme a Patitas 🐾" />
    </form>
  )
}

export default function RegistroClient() {
  const [tipo, setTipo] = useState<'fundacion' | 'usuario' | null>(null)

  if (tipo === 'fundacion') {
    return <FormFundacion onVolver={() => setTipo(null)} />
  }

  if (tipo === 'usuario') {
    return <FormUsuario onVolver={() => setTipo(null)} />
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="text-4xl mb-3">🐾</div>
        <h1 className="text-xl font-bold text-stone-800 mb-1">¿Cómo quieres unirte?</h1>
        <p className="text-sm text-stone-400">Elige el tipo de cuenta que mejor describe tu rol</p>
      </div>

      <button
        onClick={() => setTipo('fundacion')}
        className="flex items-start gap-4 p-4 rounded-2xl border-2 border-stone-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-left group cursor-pointer"
      >
        <span className="text-3xl mt-0.5">🏢</span>
        <div>
          <div className="font-bold text-stone-800 group-hover:text-orange-600 transition-colors text-sm">
            Soy una Fundación
          </div>
          <div className="text-xs text-stone-400 mt-0.5 leading-relaxed">
            Organización de rescate o bienestar animal. Necesitarás tu NIT colombiano.
          </div>
        </div>
      </button>

      <button
        onClick={() => setTipo('usuario')}
        className="flex items-start gap-4 p-4 rounded-2xl border-2 border-stone-100 hover:border-rose-300 hover:bg-rose-50 transition-all text-left group cursor-pointer"
      >
        <span className="text-3xl mt-0.5">🙋</span>
        <div>
          <div className="font-bold text-stone-800 group-hover:text-rose-600 transition-colors text-sm">
            Soy Voluntario / Adoptante
          </div>
          <div className="text-xs text-stone-400 mt-0.5 leading-relaxed">
            Quiero adoptar un perrito o apoyar como voluntario en fundaciones.
          </div>
        </div>
      </button>
    </div>
  )
}
