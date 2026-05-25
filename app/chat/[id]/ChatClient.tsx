'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { enviarMensaje } from '@/app/actions/chat'

type Mensaje = {
  id: string
  emisor_id: string
  contenido: string
  created_at: string
}

export default function ChatClient({
  conversacionId,
  mensajesIniciales,
  userId,
}: {
  conversacionId: string
  mensajesIniciales: Mensaje[]
  userId: string
}) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${conversacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${conversacionId}`,
        },
        (payload) => {
          const nuevo = payload.new as Mensaje
          setMensajes((prev) => {
            if (prev.some((m) => m.id === nuevo.id)) return prev
            return [...prev, nuevo]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversacionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido || enviando) return
    setEnviando(true)
    setTexto('')
    await enviarMensaje(conversacionId, contenido)
    setEnviando(false)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {mensajes.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-12">
            Ningún mensaje aún. ¡Sé el primero en escribir! 🐾
          </p>
        )}
        {mensajes.map((m) => {
          const esMio = m.emisor_id === userId
          return (
            <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl ${
                  esMio
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white border border-stone-100 shadow-sm text-stone-700 rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed break-words">{m.contenido}</p>
                <p className={`text-[10px] mt-1 text-right ${esMio ? 'text-orange-200' : 'text-stone-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleEnviar}
        className="flex gap-2 px-4 py-3 bg-white border-t border-stone-100"
      >
        <input
          ref={inputRef}
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
          disabled={enviando}
          className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="bg-orange-500 text-white font-bold w-11 h-11 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-40 flex items-center justify-center text-lg"
        >
          ↑
        </button>
      </form>
    </div>
  )
}
