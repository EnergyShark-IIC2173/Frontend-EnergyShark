import { useState } from 'react'
import { useApiClient } from '../../api/client'
import { getCycle } from '../../api/endpoints'
import { Icon } from '../ui/Icon'
import { btnSecondary, inputBase, textError } from '../ui/classes'

// Buscar un ciclo por su ID (DF-033) con GET /api/cycles/{cycleId}: si existe, se abre su diálogo aunque no esté
// en la página actual. Si no, el aviso queda junto al campo.
export function CycleSearch({ onFound }) {
  const { apiFetch } = useApiClient()
  const [value, setValue] = useState('')
  const [state, setState] = useState({ loading: false, error: null })

  async function onSubmit(e) {
    e.preventDefault()
    const id = value.trim()
    if (!id) return
    setState({ loading: true, error: null })
    try {
      await getCycle(apiFetch, id)
      setState({ loading: false, error: null })
      onFound(id, e.currentTarget)
    } catch (error) {
      setState({ loading: false, error: error?.status === 404 ? `No existe el ciclo ${id}.` : error?.message || 'No se pudo buscar el ciclo.' })
    }
  }

  return (
    <form role="search" onSubmit={onSubmit} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <label htmlFor="cycle-search" className="sr-only">Buscar ciclo por ID</label>
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sand-600 dark:text-sand-400" />
          <input
            id="cycle-search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (state.error) setState({ loading: false, error: null })
            }}
            placeholder="Buscar ciclo (ej. cycle-9431)"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? 'cycle-search-error' : undefined}
            className={`${inputBase} w-72 pl-9 font-mono placeholder:font-sans`}
          />
        </div>
        <button type="submit" disabled={state.loading} className={`${btnSecondary} disabled:cursor-wait disabled:opacity-60`}>
          {state.loading ? 'Buscando…' : 'Abrir'}
        </button>
      </div>
      {state.error ? <p id="cycle-search-error" role="alert" className={`text-sm ${textError}`}>{state.error}</p> : null}
    </form>
  )
}
