import { useState } from 'react'
import negotiationMock from '../mocks/negotiation.json'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { TableCard } from './ui/TableCard'
import { btnPrimary, inputBase, labelBase, td, th, tr } from './ui/classes'

export function NegotiationAdmin() {
  const [negotiations, setNegotiations] = useState(negotiationMock)
  const [formData, setFormData] = useState({
    cycleId: 'cycle-9431',
    direction: 'take',
    quantity: '',
    pricePerEnergy: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newProposal = {
      id: Date.now(),
      cycleId: formData.cycleId,
      idpk: crypto.randomUUID(),
      direction: formData.direction,
      quantity: Number(formData.quantity),
      pricePerEnergy: Number(formData.pricePerEnergy),
      settledPricePerEnergy: null,
      status: 'proposed',
      proposedAt: new Date().toISOString(),
      confirmedAt: null,
      paidAt: null
    }
    setNegotiations([newProposal, ...negotiations])
    setFormData({ ...formData, quantity: '', pricePerEnergy: '' })
  }

  return (
    <div className="flex w-full flex-col gap-6">
      
      <Card>
        <h2 className="text-xl font-semibold tracking-tight text-text-h">Crear Propuesta de Negociación</h2>
        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <div className="flex flex-col gap-2">
            <label htmlFor="neg-cycle" className={labelBase}>Ciclo</label>
            <input 
              id="neg-cycle"
              type="text" 
              value={formData.cycleId}
              onChange={e => setFormData({...formData, cycleId: e.target.value})}
              className={inputBase}
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="neg-direction" className={labelBase}>Dirección</label>
            <select 
              id="neg-direction"
              value={formData.direction}
              onChange={e => setFormData({...formData, direction: e.target.value})}
              className={inputBase}
            >
              <option value="take">Comprar (Take)</option>
              <option value="give">Vender (Give)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="neg-quantity" className={labelBase}>Cantidad <span className="normal-case">(kWh)</span></label>
            <input 
              id="neg-quantity"
              type="number" 
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              className={`${inputBase} tabular-nums`}
              required min="1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="neg-price" className={labelBase}>Precio <span className="normal-case">(cr)</span></label>
            <input 
              id="neg-price"
              type="number" 
              value={formData.pricePerEnergy}
              onChange={e => setFormData({...formData, pricePerEnergy: e.target.value})}
              className={`${inputBase} tabular-nums`}
              required min="1" step="0.01"
            />
          </div>
          <button type="submit" className={`${btnPrimary} h-11 w-full xl:w-auto`}>Proponer</button>
        </form>
      </Card>

      <TableCard>
        <thead>
          <tr>
            <th className={th}>ID / Ciclo</th>
            <th className={th}>Tipo</th>
            <th className={th}>Energía</th>
            <th className={th}>Precio Ofertado</th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {negotiations.map((neg) => (
            <tr key={neg.id} className={tr}>
              <td className={td}>
                <span className="block font-medium text-text-h tabular-nums">#{neg.id}</span>
                <span className="block text-xs">{neg.cycleId}</span>
              </td>
              <td className={`${td} font-semibold text-accent`}>{neg.direction.toUpperCase()}</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{neg.quantity} kWh</td>
              <td className={`${td} whitespace-nowrap tabular-nums`}>{neg.pricePerEnergy} cr</td>
              <td className={td}>
                <Badge tone={neg.status === 'confirmed' || neg.status === 'paid' ? 'success' : 'neutral'}>
                  {neg.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  )
}
