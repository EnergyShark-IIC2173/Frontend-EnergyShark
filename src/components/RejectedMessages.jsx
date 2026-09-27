import rejectedData from '../mocks/rejected.json'

export function RejectedMessages() {
  return (
    <div className="flex w-full max-w-[900px] flex-col gap-6">
      <div className="text-left">
        <h2 className="mt-[0.83em] mb-2 font-sans text-[1.5em] font-semibold text-text-h">Registro de Duplicados y NACKs</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="p-4 text-left font-bold text-text-h">Tipo (Kind)</th>
              <th className="p-4 text-left font-bold text-text-h">Razón</th>
              <th className="p-4 text-left font-bold text-text-h">Código</th>
              <th className="p-4 text-left font-bold text-text-h">Detalle</th>
              <th className="p-4 text-left font-bold text-text-h">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rejectedData.map((msg) => (
              <tr key={msg.id} className="border-b border-border">
                <td className="p-4">
                  <span className={`rounded-sm px-2 py-1 text-[14px] ${msg.kind === 'duplicate' ? 'bg-caution/15 text-caution' : 'bg-danger/20 text-danger'}`}>
                    {msg.kind.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-text-h">{msg.reason || '-'}</td>
                <td className="p-4">{msg.code || '-'}</td>
                <td className="p-4">{msg.detail}</td>
                <td className="p-4">{new Date(msg.occurredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}