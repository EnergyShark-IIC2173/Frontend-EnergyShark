// Trazos de ola para el fondo del login (DF-036). Puro, para probarlo con `node --test`.
// `crests`: [[ancho, alto], ...] de un período, alternando cresta y valle alrededor de la línea media.
// El período se dibuja `repeats` veces (par): el svg mide el doble del ancho de la pantalla y correrlo un 50 % no
// deja salto. Más repeticiones, más crestas por pantalla. Devuelve el path y el viewBox.
export function wavePath(crests, height = 20, repeats = 2) {
  const mid = height / 2
  const period = crests.reduce((sum, [w]) => sum + w, 0)
  let d = `M0 ${mid}`
  for (let rep = 0; rep < repeats; rep++) {
    crests.forEach(([w, a], i) => {
      const dy = i % 2 === 0 ? -a : a
      d += ` c${round(w / 3)} ${round(dy)} ${round((2 * w) / 3)} ${round(dy)} ${round(w)} 0`
    })
  }
  return { d, viewBox: `0 0 ${round(period * repeats)} ${height}`, period }
}

const round = (n) => Math.round(n * 100) / 100
