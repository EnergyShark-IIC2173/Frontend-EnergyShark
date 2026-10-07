import { Card } from './Card'
import { Icon } from './Icon'
import { btnPrimary, btnSecondary } from './classes'

// Estados de carga, error y vacío de las vistas (DF-014). Presentacionales: sin hooks (DF-010).

export function LoadingState({ label = 'Cargando…' }) {
  return (
    <Card>
      <p role="status" className="flex items-center gap-2 text-sm text-text-h">
        <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
        {label}
      </p>
    </Card>
  )
}

// onRelogin solo aparece si el error es de sesión (login_required / consent_required, DF-022).
export function ErrorState({ error, onRetry, onRelogin, title = 'No se pudieron cargar los datos' }) {
  return (
    <Card>
      <div role="alert" className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="font-semibold text-text-h">{title}</p>
          <p className="mt-1 text-sm break-words text-text">
            {error?.message || 'Error desconocido'}
            {error?.status ? <span className="text-muted"> (HTTP {error.status})</span> : null}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {error?.authRequired && onRelogin ? (
              <button type="button" onClick={() => onRelogin()} className={btnPrimary}>Volver a iniciar sesión</button>
            ) : null}
            {onRetry ? (
              <button type="button" onClick={onRetry} className={btnSecondary}>Reintentar</button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function EmptyState({ title, children, icon = 'history' }) {
  return (
    <Card>
      <div role="status" className="flex items-start gap-3">
        <Icon name={icon} className="mt-0.5 size-5 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="font-semibold text-text-h">{title}</p>
          {children ? <div className="mt-1 text-sm text-text">{children}</div> : null}
        </div>
      </div>
    </Card>
  )
}

// Aviso chico cuando un poll falla pero hay datos anteriores en pantalla.
export function StaleNotice({ error }) {
  if (!error) return null
  return (
    <p role="status" className="text-sm text-danger">
      No se pudo actualizar: {error.message}. Se muestran los últimos datos recibidos.
    </p>
  )
}
