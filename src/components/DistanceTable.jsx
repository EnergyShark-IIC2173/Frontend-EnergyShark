import distanceData from '../mocks/distance.json'
import { Badge } from './ui/Badge'
import { TableCard } from './ui/TableCard'
import { td, th, tr } from './ui/classes'

export function DistanceTable() {
  const { cityId, updatedAt, distances } = distanceData

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-h">Conectividad de {cityId}</h2>
        <p className="mt-1 text-sm text-text">
          Última actualización: {new Date(updatedAt).toLocaleString()}
        </p>
      </div>

      <TableCard>
        <thead>
          <tr>
            <th className={th}>Destino</th>
            <th className={th}>Distancia <span className="normal-case">(m)</span></th>
            <th className={th}>Costo <span className="normal-case">(cr/kWh*km)</span></th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(distances).map(([destination, data]) => (
            <tr key={destination} className={tr}>
              <td className={`${td} font-semibold text-accent`}>
                {destination}
              </td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{data.distance.toLocaleString()}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{data.transportCost}</td>
              <td className={td}>
                <Badge tone={data.enabled ? 'cyan' : 'pink'}>
                  {data.enabled ? 'Habilitado' : 'Deshabilitado'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  )
}
