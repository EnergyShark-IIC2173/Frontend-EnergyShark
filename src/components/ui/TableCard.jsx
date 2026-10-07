import { Card } from './Card'

// Las tablas anchas hacen scroll dentro de su card, nunca en el body (DF-011)
export function TableCard({ children }) {
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
    </Card>
  )
}
