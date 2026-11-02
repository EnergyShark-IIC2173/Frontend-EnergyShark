import { Icon } from './Icon'
import { textPrimary } from './classes'

// Botón "Actualizar" de cada vista (DF-044, reemplaza el anillo de refresco de DF-034). El único reloj de la app es
// el del ciclo, en la sidebar; las vistas siguen haciendo polling en segundo plano. Se conserva la interfaz
// (updatedAt, intervalMs) para no tocar las vistas: el título dice cada cuánto se actualiza.
export function RefreshTimer({ intervalMs, loading = false, onRefresh }) {
  const every = intervalMs ? ` (se actualiza cada ${Math.round(intervalMs / 1000)} s)` : ''
  const label = loading ? 'Actualizando' : `Actualizar ahora${every}`
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-sand-200 bg-card transition-colors duration-150 hover:bg-sand-100 focus-ring disabled:cursor-wait dark:border-sand-800 dark:bg-sand-900 dark:hover:bg-sand-800"
    >
      <Icon name="refresh" className={`size-5 ${textPrimary} ${loading ? 'motion-safe:animate-spin' : ''}`} />
    </button>
  )
}
