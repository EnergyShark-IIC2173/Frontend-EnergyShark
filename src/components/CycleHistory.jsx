import { useRef, useState } from 'react'
import { listCycles } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { CurrentCycleCard, CycleTile } from './cycles/CycleCards'
import { CycleDialog } from './cycles/CycleDialog'
import { CycleSearch } from './cycles/CycleSearch'
import { neighbor } from '../lib/pagination'
import { Icon } from './ui/Icon'
import { Pager } from './ui/Pager'
import { btnSecondary } from './ui/classes'
import { EmptyState, ErrorState, LoadingState, StaleNotice } from './ui/States'
import { Marker, RefreshButton, ViewHeader } from './ui/ViewHeader'

// Grilla de ciclos (DF-033). 9 por página: en la página 1 el más reciente ocupa 2×2 desde xl (la mitad del ancho)
// y caben 8 chicas exactas; en las demás, 3 filas de 3. El listado trae la cabecera; el detalle se pide al abrir el
// diálogo (DF-024). Polling suave solo en la página 1, donde está el ciclo en curso.
const LIMIT = 9
const POLL_MS = 30_000
// Las tarjetas entran una tras otra, de arriba hacia abajo (DF-032). Solo al montarse: el polling no las re-anima.
const STAGGER_MS = 60

const enter = (i) => ({
  className: 'motion-safe:animate-rise-in motion-reduce:animate-fade-in',
  style: { animationDelay: `${i * STAGGER_MS}ms` },
})

export function CycleHistory() {
  const [page, setPage] = useState(1)
  // Ciclo abierto en el diálogo y la tarjeta desde la que crece (DF-033).
  const [selected, setSelected] = useState(null)
  const { data, loading, error, reload, relogin } = useApiQuery(
    (api) => listCycles(api, { page, limit: LIMIT }),
    { page },
    { pollMs: page === 1 ? POLL_MS : null },
  )
  const cycles = data?.data ?? []
  const open = (cycleId) => (origin) => setSelected({ cycleId, origin })
  const gridRef = useRef(null)
  // Al pasar de página desde el diálogo se abre el primer o el último ciclo de la nueva página cuando llega.
  const [pendingEdge, setPendingEdge] = useState(null)
  if (pendingEdge && data?.page === page && cycles.length > 0) {
    const target = pendingEdge === 'first' ? cycles[0] : cycles[cycles.length - 1]
    setPendingEdge(null)
    setSelected({ cycleId: target.cycleId, origin: null })
  }

  // Cambiar de página sube al inicio de la grilla y le pasa el foco, así el paginador de abajo no te deja al fondo (DF-033).
  function goToPage(next, { scroll = true } = {}) {
    setPage(next)
    if (!scroll) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    gridRef.current?.focus({ preventScroll: true })
  }

  // Anterior/siguiente dentro del diálogo, cruzando de página en los bordes.
  const index = selected ? cycles.findIndex((c) => c.cycleId === selected.cycleId) : -1
  const neighborOf = (dir) => (index >= 0 && data ? neighbor(index, cycles.length, page, data.totalPages, dir) : null)
  const hasPrev = Boolean(neighborOf(-1))
  const hasNext = Boolean(neighborOf(1))
  function move(dir) {
    const n = neighborOf(dir)
    if (!n) return
    if (n.index !== undefined) {
      const id = cycles[n.index].cycleId
      setSelected({ cycleId: id, origin: document.querySelector(`[data-cycle-id="${id}"]`) })
    } else {
      setPendingEdge(n.edge)
      goToPage(n.page, { scroll: false })
    }
  }

  let content
  if (!data && loading) content = <LoadingState label="Cargando ciclos…" />
  else if (!data && error) content = <ErrorState error={error} onRetry={reload} onRelogin={relogin} />
  else if (cycles.length === 0) {
    content = <EmptyState title="Aún no hay ciclos">Aparecen cuando la central abre el primer ciclo de la ciudad.</EmptyState>
  } else {
    const [first, ...rest] = cycles
    const featured = page === 1
    content = (
      <>
        <div ref={gridRef} tabIndex={-1} aria-label={`Ciclos, página ${page}`} role="region" className={`grid grid-cols-1 gap-4 outline-none md:grid-cols-2 ${featured ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
          {featured ? (
            <CurrentCycleCard key={first.cycleId} cycle={first} onOpen={open(first.cycleId)} {...enter(0)} className={`md:col-span-2 xl:row-span-2 ${enter(0).className}`} />
          ) : (
            <CycleTile key={first.cycleId} cycle={first} onOpen={open(first.cycleId)} {...enter(0)} />
          )}
          {rest.map((cycle, i) => (
            <CycleTile key={cycle.cycleId} cycle={cycle} onOpen={open(cycle.cycleId)} {...enter(i + 1)} />
          ))}
        </div>
        <Pager label="Paginación de ciclos" noun="ciclos" page={data.page} totalPages={data.totalPages} total={data.total} onChange={goToPage} disabled={loading} />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ViewHeader
        title={<>Historial de <Marker>ciclos</Marker></>}
        subtitle={page === 1 ? `Más reciente primero (RF01). La página 1 se actualiza cada ${POLL_MS / 1000} s.` : 'Más reciente primero (RF01).'}
      >
        <RefreshButton onClick={reload} loading={loading} />
      </ViewHeader>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-start gap-2">
          <CycleSearch onFound={(id, form) => setSelected({ cycleId: id, origin: form })} />
          {page > 1 ? (
            <button type="button" onClick={() => goToPage(1)} className={btnSecondary}>
              <Icon name="first" className="size-4" />
              Volver al ciclo actual
            </button>
          ) : null}
        </div>
        {/* Un solo paginador, abajo (DF-034); aquí solo la página actual. */}
        {data ? <p className="self-center text-sm text-sand-600 tabular-nums dark:text-sand-400">Página <span className="font-semibold text-ink dark:text-paper">{data.page}</span> de {data.totalPages}</p> : null}
      </div>
      <StaleNotice error={data ? error : null} />
      {content}
      {selected ? (
        <CycleDialog
          cycleId={selected.cycleId}
          origin={selected.origin}
          live={page === 1 && selected.cycleId === cycles[0]?.cycleId}
          position={index >= 0 && data ? (page - 1) * LIMIT + index + 1 : null}
          total={data?.total}
          onPrev={hasPrev ? () => move(-1) : null}
          onNext={hasNext ? () => move(1) : null}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  )
}
