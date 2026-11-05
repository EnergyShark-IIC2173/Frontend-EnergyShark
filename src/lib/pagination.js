// Números del paginador de ciclos (DF-033): siempre la primera y la última, la actual con `around` vecinas a cada
// lado, y 'gap' donde se saltan páginas. Ej.: page 6 de 12 → [1, 'gap', 5, 6, 7, 'gap', 12].
export function pageItems(page, totalPages, around = 1) {
  if (!totalPages || totalPages < 1) return []
  const pages = new Set([1, totalPages])
  for (let p = page - around; p <= page + around; p++) if (p >= 1 && p <= totalPages) pages.add(p)
  const sorted = [...pages].sort((a, b) => a - b)
  const items = []
  sorted.forEach((p, i) => {
    if (i > 0) {
      const gap = p - sorted[i - 1]
      // Un hueco de una sola página se muestra como número: no tiene sentido una elipsis que tapa un solo botón.
      if (gap === 2) items.push(p - 1)
      else if (gap > 2) items.push('gap')
    }
    items.push(p)
  })
  return items
}

// Vecino de un ciclo para "anterior/siguiente" dentro del diálogo, pasando de página en los bordes.
// Devuelve { index } en la misma página, { page, edge } si hay que cargar la vecina, o null.
export function neighbor(index, count, page, totalPages, step) {
  const target = index + step
  if (target >= 0 && target < count) return { index: target }
  if (step < 0 && page > 1) return { page: page - 1, edge: 'last' }
  if (step > 0 && page < totalPages) return { page: page + 1, edge: 'first' }
  return null
}
