import { useNow } from '../../hooks/useNow'
import { connectionText } from '../../lib/feed'
import { btnPrimary, btnSecondary, textPrimary, textSecondary } from '../ui/classes'

// Estado de la conexión del feed (DF-047): siempre visible en la vista. Presentacional salvo la cuenta regresiva.
const DOT = {
  open: 'bg-accent motion-safe:animate-pulse',
  connecting: 'bg-sand-400',
  reconnecting: 'bg-rose',
  auth: 'bg-coral',
  stopped: 'bg-sand-400',
}

export function StatusDot({ status, className = 'size-2.5' }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-full ${DOT[status] ?? DOT.stopped} ${className}`} />
}

export function ConnectionStatus({ status, detail, lastId, received, resets, onReconnect, onRelogin }) {
  const now = useNow(1000, status === 'reconnecting')
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* El lector de pantalla oye solo los cambios de estado, no la cuenta regresiva de cada segundo. */}
      <span role="status" className="sr-only">Feed: {connectionText(status)}</span>
      <p aria-hidden="true" className={`flex items-center gap-2 text-sm font-semibold ${textPrimary}`}>
        <StatusDot status={status} />
        {connectionText(status, detail, now)}
      </p>
      <p className={`text-xs tabular-nums ${textSecondary}`}>
        Último id <span className={`font-mono ${textPrimary}`}>{lastId ?? 'ninguno'}</span> · {received} recibidos
        {resets > 0 ? ` · ${resets} reinicio${resets === 1 ? '' : 's'} del servidor` : ''}
      </p>
      {status === 'auth' ? (
        <button type="button" onClick={() => onRelogin()} className={btnPrimary}>Volver a iniciar sesión</button>
      ) : status === 'reconnecting' ? (
        <button type="button" onClick={onReconnect} className={btnSecondary}>Reconectar ahora</button>
      ) : null}
    </div>
  )
}
