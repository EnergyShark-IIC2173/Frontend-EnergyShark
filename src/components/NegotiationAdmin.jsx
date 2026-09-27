import { useState } from 'react'
import negotiationMock from '../mocks/negotiation.json'

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
    <div className="flex w-full max-w-[900px] flex-col gap-8">
      
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mt-0 mb-[0.83em] text-left font-sans text-[1.5em] font-semibold text-text-h">Crear Propuesta de Negociación</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-1 flex-col text-left">
            <label className="mb-2 text-[14px] text-text-h">Ciclo</label>
            <input 
              type="text" 
              value={formData.cycleId}
              onChange={e => setFormData({...formData, cycleId: e.target.value})}
              className="rounded-md border border-border bg-bg p-2.5 font-[Arial] text-[13.3333px] leading-[normal] tracking-normal text-text box-content"
              required 
            />
          </div>
          <div className="flex flex-1 flex-col text-left">
            <label className="mb-2 text-[14px] text-text-h">Dirección</label>
            <select 
              value={formData.direction}
              onChange={e => setFormData({...formData, direction: e.target.value})}
              className="rounded-md border border-border bg-bg p-2.5 font-[Arial] text-[13.3333px] leading-[normal] tracking-normal text-text"
            >
              <option value="take">Comprar (Take)</option>
              <option value="give">Vender (Give)</option>
            </select>
          </div>
          <div className="flex flex-1 flex-col text-left">
            <label className="mb-2 text-[14px] text-text-h">Cantidad (kWh)</label>
            <input 
              type="number" 
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              className="rounded-md border border-border bg-bg p-2.5 font-[Arial] text-[13.3333px] leading-[normal] tracking-normal text-text box-content"
              required min="1"
            />
          </div>
          <div className="flex flex-1 flex-col text-left">
            <label className="mb-2 text-[14px] text-text-h">Precio (cr)</label>
            <input 
              type="number" 
              value={formData.pricePerEnergy}
              onChange={e => setFormData({...formData, pricePerEnergy: e.target.value})}
              className="rounded-md border border-border bg-bg p-2.5 font-[Arial] text-[13.3333px] leading-[normal] tracking-normal text-text box-content"
              required min="1" step="0.01"
            />
          </div>
          <button type="submit" className="h-[42px] cursor-pointer rounded-lg border border-accent/50 bg-accent/12 px-5 py-2.5 font-sans text-[16px] leading-[normal] font-semibold tracking-normal text-accent [transition:background_0.2s,transform_0.1s] hover:bg-accent hover:text-bg active:scale-[0.98]">Proponer</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="p-4 text-left font-bold text-text-h">ID / Ciclo</th>
              <th className="p-4 text-left font-bold text-text-h">Tipo</th>
              <th className="p-4 text-left font-bold text-text-h">Energía</th>
              <th className="p-4 text-left font-bold text-text-h">Precio Ofertado</th>
              <th className="p-4 text-left font-bold text-text-h">Estado</th>
            </tr>
          </thead>
          <tbody>
            {negotiations.map((neg) => (
              <tr key={neg.id} className="border-b border-border">
                <td className="p-4">
                  <span className="text-text-h">#{neg.id}</span><br/>
                  <span className="text-[12px]">{neg.cycleId}</span>
                </td>
                <td className="p-4 text-accent">{neg.direction.toUpperCase()}</td>
                <td className="p-4">{neg.quantity} kWh</td>
                <td className="p-4">{neg.pricePerEnergy} cr</td>
                <td className="p-4">
                  <span className={`rounded-sm px-2 py-1 text-[14px] ${neg.status === 'confirmed' || neg.status === 'paid' ? 'bg-warm/15 text-warm' : 'bg-white/10 text-text-h'}`}>
                    {neg.status}
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