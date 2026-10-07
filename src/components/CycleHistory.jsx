import cyclesData from '../mocks/cycles.json'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { StatTile } from './ui/StatTile'
import { labelBase } from './ui/classes'

export function CycleHistory() {
  return (
    <div className="flex w-full flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight text-text-h">Historial de Ciclos</h2>

      {cyclesData.map((cycle) => (
        <Card key={cycle.cycleId} highlight>
          <p className={labelBase}>Ciclo</p>
          <h3 className="mt-1 text-xl font-semibold text-accent">{cycle.cycleId}</h3>

          <div className="mt-6 flex flex-col gap-6">
            <section>
              <h4 className={labelBase}>Status Statement</h4>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatTile label="Generación" value={cycle.statusStatement.generationCapacity} unit="kWh" tone="cyan" icon="bolt" />
                <StatTile label="Consumo" value={cycle.statusStatement.consumption} unit="kWh" tone="violet" icon="plug" />
                <StatTile label="Costo base" value={cycle.statusStatement.generationCost} unit="cr" tone="pink" icon="wallet" />
              </div>
            </section>

            <section>
              <h4 className={labelBase}>Balances Finales</h4>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatTile label="Presupuesto" value={cycle.report.budgetBalance} unit="cr" tone="cyan" icon="wallet" />
                <StatTile label="Energía" value={cycle.report.energyBalance} unit="kWh" tone="violet" icon="battery" />
              </div>
            </section>

            <section>
              <h4 className={labelBase}>Operaciones</h4>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl bg-bg">
                {cycle.transfers.map((t, i) => (
                  <li key={`t-${i}`} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                    <span>Transferencia ({t.type}): {t.quantity} cr</span>
                  </li>
                ))}
                {cycle.demandStatements.map((d, i) => (
                  <li key={`d-${i}`} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-violet" />
                    <span>Demand Statement: {d.quantity} kWh a {d.valuePerKwh} cr</span>
                  </li>
                ))}
                {cycle.negotiations.map((n, i) => (
                  <li key={`n-${i}`} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-pink" />
                    <span>
                      Negociación ({n.direction}): {n.quantity} kWh a {n.pricePerEnergy} cr - <Badge tone="neutral">{n.status}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Card>
      ))}
    </div>
  )
}
