import cyclesData from '../mocks/cycles.json'

export function CycleHistory() {
  return (
    <div className="flex w-full max-w-[800px] flex-col gap-6">
      <h2 className="mt-[0.83em] mb-0 text-left font-sans text-[1.5em] font-semibold text-text-h">Historial de Ciclos</h2>
      
      {cyclesData.map((cycle) => (
        <div key={cycle.cycleId} className="rounded-xl border border-border bg-surface p-6 text-left shadow-card">
          <h3 className="mt-0 mb-[1em] text-[1.17em] font-bold text-accent">{cycle.cycleId}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mt-[1.33em] mb-2 font-bold text-text-h">Status Statement</h4>
              <p>Generación: {cycle.statusStatement.generationCapacity} kWh</p>
              <p>Consumo: {cycle.statusStatement.consumption} kWh</p>
              <p>Costo base: {cycle.statusStatement.generationCost} cr</p>
            </div>

            <div>
              <h4 className="mt-[1.33em] mb-2 font-bold text-text-h">Balances Finales</h4>
              <p>Presupuesto: <span className="text-warm">{cycle.report.budgetBalance} cr</span></p>
              <p>Energía: {cycle.report.energyBalance} kWh</p>
            </div>
          </div>

          <hr className="my-4 border border-border [border-style:inset]" />

          <h4 className="mt-[1.33em] mb-2 font-bold text-text-h">Operaciones</h4>
          <ul className="m-0 list-disc pl-5">
            {cycle.transfers.map((t, i) => (
              <li key={`t-${i}`}>Transferencia ({t.type}): {t.quantity} cr</li>
            ))}
            {cycle.demandStatements.map((d, i) => (
              <li key={`d-${i}`}>Demand Statement: {d.quantity} kWh a {d.valuePerKwh} cr</li>
            ))}
            {cycle.negotiations.map((n, i) => (
              <li key={`n-${i}`}>
                Negociación ({n.direction}): {n.quantity} kWh a {n.pricePerEnergy} cr - <strong>{n.status}</strong>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}