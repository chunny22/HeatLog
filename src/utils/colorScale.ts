const STOPS: [number, [number, number, number]][] = [
  [0, [253, 230, 138]], // amber-200
  [0.5, [251, 146, 60]], // orange-400
  [1, [220, 38, 38]], // red-600
]

// Follows the light/dark theme; see --c-nodata in index.css.
const NO_DATA_COLOR = 'var(--c-nodata)'

export function muscleColor(normalizedVolume: number): string {
  if (!normalizedVolume || normalizedVolume <= 0) return NO_DATA_COLOR

  const v = Math.min(1, Math.max(0, normalizedVolume))
  let lower = STOPS[0]
  let upper = STOPS[STOPS.length - 1]

  for (let i = 0; i < STOPS.length - 1; i++) {
    if (v >= STOPS[i][0] && v <= STOPS[i + 1][0]) {
      lower = STOPS[i]
      upper = STOPS[i + 1]
      break
    }
  }

  const range = upper[0] - lower[0]
  const t = range === 0 ? 0 : (v - lower[0]) / range
  const rgb = lower[1].map((channel, i) => Math.round(channel + (upper[1][i] - channel) * t))

  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}
