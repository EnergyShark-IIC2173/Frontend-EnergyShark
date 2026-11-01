import { marketPhase, reportPending } from '../../lib/cycles'
import { EMPTY, fmtClock, fmtDate, fmtDay, fmtTime } from '../../lib/format'
import { cyclePhase, marketPhaseLabel } from '../../lib/status'
import { Badge } from '../ui/Badge'
import { textSecondary } from '../ui/classes'

// Piezas compartidas por las tarjetas y el diálogo de ciclos (DF-033).

export function ReportBadge({ cycle }) {
  if (cycle.negotiationReportSent) return <Badge tone="settled">Reporte enviado</Badge>
  if (reportPending(cycle)) return <Badge tone="neutral">Reporte pendiente</Badge>
  return <Badge tone="error">Reporte no enviado</Badge>
}

export function PhaseBadge({ cycle }) {
  const v3 = marketPhase(cycle)
  const phase = v3 ? marketPhaseLabel(v3) : cyclePhase(cycle.phase)
  return <Badge tone={phase.tone}>{phase.label}</Badge>
}

// `compact`: solo la ventana del mercado, para las tarjetas chicas.
export function WindowLine({ cycle, compact = false, className = '' }) {
  const m = cycle.market
  const text = m
    ? compact
      ? `${fmtDay(m.opensAt)} · ${fmtClock(m.opensAt)} a ${fmtClock(m.closesAt)}`
      : `Mercado de ${fmtDate(m.opensAt)} a ${fmtTime(m.closesAt)} · Cierre hasta ${fmtTime(cycle.validUntil)}`
    : cycle.windowOpensAt
      ? `${compact ? '' : 'Ventana: '}de ${fmtDate(cycle.windowOpensAt)} a ${fmtTime(cycle.windowClosesAt)}`
      : `${compact ? '' : 'Ventana: '}${EMPTY}`
  return <p className={`text-sm tabular-nums ${textSecondary} ${className}`}>{text}</p>
}
