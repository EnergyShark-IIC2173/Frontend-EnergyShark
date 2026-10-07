import rejectedData from '../mocks/rejected.json'
import { Badge } from './ui/Badge'
import { TableCard } from './ui/TableCard'
import { td, th, tr } from './ui/classes'

export function RejectedMessages() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-text-h">Registro de Duplicados y NACKs</h2>
      </div>

      <TableCard>
        <thead>
          <tr>
            <th className={th}>Tipo (Kind)</th>
            <th className={th}>Razón</th>
            <th className={th}>Código</th>
            <th className={th}>Detalle</th>
            <th className={th}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {rejectedData.map((msg) => (
            <tr key={msg.id} className={tr}>
              <td className={td}>
                <Badge tone={msg.kind === 'duplicate' ? 'orange' : 'pink'}>
                  {msg.kind.toUpperCase()}
                </Badge>
              </td>
              <td className={`${td} font-mono text-xs text-text-h`}>{msg.reason || '-'}</td>
              <td className={`${td} tabular-nums`}>{msg.code || '-'}</td>
              <td className={`${td} min-w-56`}>{msg.detail}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{new Date(msg.occurredAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  )
}
