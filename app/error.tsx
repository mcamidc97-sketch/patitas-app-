'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: 32, fontFamily: 'monospace' }}>
      <h2>Error en la página</h2>
      <p><strong>Mensaje:</strong> {error.message}</p>
      {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
      <pre style={{ background: '#f5f5f5', padding: 16, overflowX: 'auto', fontSize: 12 }}>
        {error.stack}
      </pre>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
