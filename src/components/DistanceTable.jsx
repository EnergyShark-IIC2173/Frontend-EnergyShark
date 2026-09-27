import distanceData from '../mocks/distance.json'

export function DistanceTable() {
  const { cityId, updatedAt, distances } = distanceData

  return (
    <div className="flex w-full max-w-[800px] flex-col gap-6">
      <div className="text-left">
        <h2 className="mt-[0.83em] mb-2 font-sans text-[1.5em] font-semibold text-text-h">Conectividad de {cityId}</h2>
        <p className="m-0 text-text">
          Última actualización: {new Date(updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="p-4 text-left font-bold text-text-h">Destino</th>
              <th className="p-4 text-left font-bold text-text-h">Distancia (m)</th>
              <th className="p-4 text-left font-bold text-text-h">Costo (cr/kWh*km)</th>
              <th className="p-4 text-left font-bold text-text-h">Estado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(distances).map(([destination, data]) => (
              <tr key={destination} className="border-b border-border">
                <td className="p-4 font-bold text-accent">
                  {destination}
                </td>
                <td className="p-4">{data.distance.toLocaleString()}</td>
                <td className="p-4">{data.transportCost}</td>
                <td className="p-4">
                  <span className={`rounded-sm px-2 py-1 ${data.enabled ? 'bg-warm/15 text-warm' : 'bg-danger/20 text-danger'}`}>
                    {data.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}