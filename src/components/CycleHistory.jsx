import { useState } from 'react'
import { listCycles } from '../api/endpoints'
import { useApiQuery } from '../api/useApiQuery'
import { CurrentCycleCard, CycleTile } from './cycles/CycleCards'
import { CycleDialog } from './cycles/CycleDialog'
import { Pagination } from './ui/Pagination'
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
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${featured ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
          {featured ? (
            <CurrentCycleCard key={first.cycleId} cycle={first} onOpen={open(first.cycleId)} {...enter(0)} className={`md:col-span-2 xl:row-span-2 ${enter(0).className}`} />
          ) : (
            <CycleTile key={first.cycleId} cycle={first} onOpen={open(first.cycleId)} {...enter(0)} />
          )}
          {rest.map((cycle, i) => (
            <CycleTile key={cycle.cycleId} cycle={cycle} onOpen={open(cycle.cycleId)} {...enter(i + 1)} />
          ))}
        </div>
        <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} disabled={loading} />
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
      <StaleNotice error={data ? error : null} />
      {content}
      {selected ? (
        <CycleDialog
          cycleId={selected.cycleId}
          origin={selected.origin}
          live={page === 1 && selected.cycleId === cycles[0]?.cycleId}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  )
}
