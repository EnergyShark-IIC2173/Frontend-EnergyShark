# Diseño anterior (pre-Tailwind)

Referencia del diseño de EnergyShark antes de migrar a Tailwind CSS v4, con la clase Tailwind que reemplaza cada valor. La página se ve igual que antes: la migración solo cambió cómo se escriben los estilos.

Los estilos actuales están en `src/index.css` (tokens en `@theme`) y en el `className` de cada componente.

> **`src/App.css` se conserva solo como referencia y no se importa.** Es CSS del template de Vite (`.hero`, `#next-steps`, `.counter`, `.ticks`...) y no define colores. Si se vuelve a importar, sus `var(--accent)`, `var(--border)`, etc. no resuelven, porque ahora los tokens se llaman `--color-*`. Además, `#center` volvería a aplicar estilos sobre la `<section>` de `App.jsx`.

## Colores

| Antes | Valor | Tailwind ahora |
|---|---|---|
| `--bg` | `#111344` | `bg-bg`, `text-bg` |
| `--surface` | `#03256c` | `bg-surface` |
| `--surface-hover` | `#163a7e` | `bg-surface-hover` |
| `--border` | `#2541b2` | `border-border` |
| `--text` | `#c7d0f0` | `text-text` |
| `--text-h` | `#ffffff` | `text-text-h` |
| `--accent` | `#06bee1` | `text-accent`, `bg-accent` |
| `--accent-bg` | `rgba(6, 190, 225, 0.12)` | `bg-accent/12` |
| `--accent-border` | `rgba(6, 190, 225, 0.5)` | `border-accent/50` |
| `--success` | `#dd6e42` | `text-warm` (renombrado: es naranja, no un "success") |
| `--success-bg` | `rgba(221, 110, 66, 0.15)` | `bg-warm/15` |
| `#ff6b6b` (suelto en componentes) | `#ff6b6b` | `text-danger` |
| `#ff6b6b33` (suelto) | `rgba(255, 107, 107, 0.2)` | `bg-danger/20` |
| `#ffc107` (suelto, RejectedMessages) | `#ffc107` | `text-caution` |
| `rgba(255, 193, 7, 0.15)` (suelto) | | `bg-caution/15` |
| `rgba(255, 255, 255, 0.1)` (suelto, NegotiationAdmin) | | `bg-white/10` |

Tailwind v4 escribe los colores con opacidad en `oklab(...)` en vez de `rgba(...)`. La diferencia es de hasta 2/255 en un canal y no se nota.

## Sombra, fuentes y base

| Antes | Tailwind ahora |
|---|---|
| `--shadow`: `rgba(0,0,0,.35) 0 10px 25px -5px, rgba(0,0,0,.2) 0 4px 6px -2px` | `shadow-card` |
| `--sans`: `'Segoe UI', system-ui, Roboto, sans-serif` | `font-sans` |
| `--mono`: `ui-monospace, Consolas, monospace` | `font-mono` |
| `:root` 18px/145%, letter-spacing 0.18px, 16px con ancho ≤ 1024px | igual, en `@layer base` de `src/index.css` |
| `#root` 1126px, centrado, flex col | igual, en `@layer base` de `src/index.css` |

## Estilos globales que pasaron a clases

Antes estos estilos se aplicaban a todos los elementos de su tipo. Ahora cada elemento lleva sus clases.

| Antes | Clases ahora |
|---|---|
| `h1`: 48px, 600, `--text-h`, letter-spacing -1.2px; 32px con ancho ≤ 1024px | `text-[48px] font-semibold text-text-h tracking-[-1.2px] max-[1025px]:text-[32px]` |
| `h2`: 600, `--text-h` (tamaño 1.5em del navegador) | `text-[1.5em] font-semibold text-text-h mt-[0.83em]` |
| `button`: 16px, 600, padding 10px 20px, radio 8px, borde `--accent-border`, fondo `--accent-bg`, color `--accent` | `px-5 py-2.5 rounded-lg border border-accent/50 bg-accent/12 text-accent text-[16px] font-semibold` |
| `button:hover`: fondo `--accent`, texto `--bg` | `hover:bg-accent hover:text-bg` |
| `button:active`: `scale(0.98)`; `transition: background .2s, transform .1s` | `active:scale-[0.98] [transition:background_0.2s,transform_0.1s]` |
| `p { margin: 0 }` | ya lo hace el preflight de Tailwind |
| `code`: mono 15px, padding 4px 8px, radio 4px, fondo `rgba(255,255,255,.06)` | no se usa en ningún componente |

## Ajustes para que se vea igual (preflight de Tailwind)

Tailwind resetea los estilos por defecto del navegador. Para que la página no cambiara:

- **`--spacing: 4px` y radios en px** (`--radius-sm` 4px, `-md` 6px, `-lg` 8px, `-xl` 12px). `:root` usa 18px, así que con los valores en `rem` que trae Tailwind `p-4` mediría 18px en vez de 16px.
- **Tamaños de texto arbitrarios** (`text-[14px]`, `text-[48px]`). No fijan line-height y heredan el 26,1px de `:root`, como antes.
- **Botones:** `leading-[normal] tracking-normal`. El navegador no hereda line-height ni letter-spacing en botones; sin esto quedaban 8px más altos.
- **Inputs y select:** `font-[Arial] text-[13.3333px] leading-[normal] tracking-normal`, que es la fuente nativa del navegador. Los `input` llevan además `box-content`.
- **`<hr>`:** `border border-border [border-style:inset]`, la línea de 2px que dibuja el navegador.
- **Títulos h2/h3/h4:** márgenes en `em` iguales a los del navegador (`mt-[0.83em]`, `mb-[1em]`, `mt-[1.33em]`).

## CSS original literal

`src/index.css` antes de la migración (commit `efe3aa5`):

```css
:root {
  --bg: #111344;
  --surface: #03256c;
  --surface-hover: #163a7e;
  --text: #c7d0f0;
  --text-h: #ffffff;
  --border: #2541b2;
  --accent: #06bee1;
  --accent-bg: rgba(6, 190, 225, 0.12);
  --accent-border: rgba(6, 190, 225, 0.5);
  --success: #dd6e42;
  --success-bg: rgba(221, 110, 66, 0.15);
  --shadow: rgba(0, 0, 0, 0.35) 0 10px 25px -5px, rgba(0, 0, 0, 0.2) 0 4px 6px -2px;

  --sans: 'Segoe UI', system-ui, Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

body {
  margin: 0;
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1, h2 {
  font-family: var(--sans);
  font-weight: 600;
  color: var(--text-h);
}

h1 {
  font-size: 48px;
  letter-spacing: -1.2px;
  margin: 16px 0 32px;
  @media (max-width: 1024px) {
    font-size: 32px;
    margin: 12px 0 20px;
  }
}

p { margin: 0; }

code {
  font-family: var(--mono);
  font-size: 15px;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text-h);
  background: rgba(255, 255, 255, 0.06);
}

button {
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: var(--accent);
  color: var(--bg);
}

button:active {
  transform: scale(0.98);
}
```

`src/App.css` sigue en el repo sin cambios: [../src/App.css](../src/App.css).
