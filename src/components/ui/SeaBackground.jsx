import { wavePath } from '../../lib/waves'

// Fondo del login, "Mar de olas" (DF-035, DF-036). Cada capa tiene su propio patrón de crestas irregulares, corre
// hacia la derecha (translateX sobre un trazo del doble del ancho) y se mece en vertical a su propio ritmo. Una
// segunda línea más tenue acompaña a cada ola como textura. Las de abajo son más altas, rápidas y marcadas; las de
// arriba, más lentas y tenues. Solo transform; decorativo y quieto con "Reducir movimiento".
const LAYERS = [
  { top: '8%', repeats: 8, h: 'h-8', o: 'opacity-25', run: '52s', bob: '11s', delay: '-14s', crests: [[30, 2], [44, 3], [26, 1.5], [40, 2.5]] },
  { top: '22%', repeats: 8, h: 'h-10', o: 'opacity-35', run: '44s', bob: '10s', delay: '-31s', crests: [[36, 3], [28, 2], [48, 3.5], [32, 2]] },
  { top: '38%', repeats: 6, h: 'h-12', o: 'opacity-45', run: '37s', bob: '9s', delay: '-6s', crests: [[40, 4], [30, 2.5], [52, 5], [34, 3]] },
  { top: '55%', repeats: 6, h: 'h-14', o: 'opacity-55', run: '30s', bob: '8.5s', delay: '-22s', crests: [[46, 5], [34, 3], [56, 6], [38, 3.5]] },
  { top: '71%', repeats: 4, h: 'h-16', o: 'opacity-70', run: '24s', bob: '7.5s', delay: '-10s', crests: [[50, 6], [38, 4], [60, 7], [42, 4.5]] },
  { top: '86%', repeats: 4, h: 'h-20', o: 'opacity-85', run: '19s', bob: '7s', delay: '-17s', crests: [[56, 7], [42, 5], [64, 8], [46, 5.5]] },
]

const WAVES = LAYERS.map((l) => ({ ...l, ...wavePath(l.crests, 20, l.repeats) }))

export function SeaBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-sand-300 dark:text-sand-700">
      {WAVES.map((l) => (
        <div
          key={l.top}
          className={`absolute inset-x-0 motion-safe:animate-sea-bob ${l.h} ${l.o}`}
          style={{ top: l.top, animationDuration: l.bob, animationDelay: l.delay }}
        >
          <svg
            viewBox={l.viewBox}
            preserveAspectRatio="none"
            className="absolute inset-y-0 left-0 h-full w-[200%] motion-safe:animate-wave-run"
            style={{ animationDuration: l.run, animationDelay: l.delay }}
          >
            <path d={l.d} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {/* Eco más tenue, un poco más abajo: textura de oleaje. */}
            <path d={l.d} transform="translate(0 3.5)" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.45} />
          </svg>
        </div>
      ))}
    </div>
  )
}
