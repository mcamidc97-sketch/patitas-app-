import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from './ChatClient'

export const metadata: Metadata = { title: 'Chat — Patitas' }

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?from=chat')

  // Verificar acceso a la conversación
  const { data: conv } = await supabase
    .from('conversaciones')
    .select('id, fundacion_id, usuario_id')
    .eq('id', id)
    .maybeSingle()

  if (!conv) redirect('/')

  const esFundacion = conv.fundacion_id === user.id
  const esUsuario = conv.usuario_id === user.id
  if (!esFundacion && !esUsuario) redirect('/')

  // Datos del otro participante
  let otroNombre = 'Contacto'
  let otroTelefono: string | null = null
  if (esFundacion) {
    const { data } = await supabase
      .from('perfiles_usuario')
      .select('nombre_completo, telefono')
      .eq('id', conv.usuario_id)
      .maybeSingle()
    otroNombre = data?.nombre_completo ?? 'Usuario'
    otroTelefono = data?.telefono ?? null
  } else {
    const { data } = await supabase
      .from('perfiles_fundacion')
      .select('nombre_fundacion, telefono')
      .eq('id', conv.fundacion_id)
      .maybeSingle()
    otroNombre = data?.nombre_fundacion ?? 'Fundación'
    otroTelefono = data?.telefono ?? null
  }

  // Mensajes iniciales
  const { data: rawMensajes } = await supabase
    .from('mensajes')
    .select('id, emisor_id, contenido, created_at')
    .eq('conversacion_id', id)
    .order('created_at', { ascending: true })

  const mensajes = (rawMensajes ?? []).map((m: Record<string, unknown>) => ({
    id: String(m.id),
    emisor_id: String(m.emisor_id),
    contenido: String(m.contenido),
    created_at: String(m.created_at),
  }))

  return (
    <div className="h-screen flex flex-col bg-orange-50 font-sans">
      <header className="flex-shrink-0 bg-white border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <Link
            href="/mis-conversaciones"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500"
            aria-label="Volver"
          >
            ←
          </Link>
          <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-600 flex-shrink-0">
            {otroNombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-800 truncate">{otroNombre}</p>
            <p className="text-[10px] text-stone-400">
              {esFundacion ? 'Voluntario / Apadrinador' : 'Fundación'}
            </p>
          </div>
          {otroTelefono && (
            <a
              href={`https://wa.me/${otroTelefono.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en WhatsApp"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          )}
        </div>
      </header>

      <ChatClient
        conversacionId={id}
        mensajesIniciales={mensajes}
        userId={user.id}
      />
    </div>
  )
}
