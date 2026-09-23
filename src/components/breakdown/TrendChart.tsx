import { useId, useRef, useState, type MouseEvent } from 'react'

export interface TrendPoint {
  date: string
  value: number
}

interface TrendChartProps {
  points: TrendPoint[]
  formatValue: (value: number) => string
}

const WIDTH = 640
const HEIGHT = 300
const PADDING = { top: 14, right: 14, bottom: 26, left: 44 }
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom
const LINE_COLOR = 'var(--c-accent)'
const GRID_COLOR = 'var(--c-line)'
const LABEL_COLOR = 'var(--c-muted)'
const DAY_MS = 86_400_000

const dayNumber = (iso: string) => Math.round(new Date(`${iso}T00:00:00`).getTime() / DAY_MS)

function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// A trend over uneven dates: points sit at their real position in time, and the
// y-axis fits the data (it doesn't start at zero, which would flatten the change).
export function TrendChart({ points, formatValue }: TrendChartProps) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const days = points.map((p) => dayNumber(p.date))
  const minDay = days[0]
  const daySpan = Math.max(days[days.length - 1] - minDay, 1)

  const values = points.map((p) => p.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.02, 1)
  const yMin = rawMin - pad
  const yMax = rawMax + pad

  const x = (i: number) => PADDING.left + (points.length === 1 ? PLOT_WIDTH / 2 : ((days[i] - minDay) / daySpan) * PLOT_WIDTH)
  const y = (v: number) => PADDING.top + PLOT_HEIGHT - ((v - yMin) / (yMax - yMin)) * PLOT_HEIGHT

  const coords = points.map((p, i) => ({ x: x(i), y: y(p.value), ...p }))
  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const baseline = PADDING.top + PLOT_HEIGHT
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${baseline} L${coords[0].x},${baseline} Z`

  const handleMove = (e: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(ctm.inverse())
    let nearest = 0
    for (let i = 1; i < coords.length; i++) {
      if (Math.abs(coords[i].x - local.x) < Math.abs(coords[nearest].x - local.x)) nearest = i
    }
    setHoverIndex(nearest)
  }

  const gridLevels = [0, 0.5, 1]
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null

  const tooltipWidth = 112
  const tooltipHeight = 36
  const tooltipX = hovered ? Math.min(Math.max(hovered.x - tooltipWidth / 2, 0), WIDTH - tooltipWidth) : 0
  const tooltipAbove = hovered ? hovered.y - tooltipHeight - 12 : 0
  const tooltipY = hovered ? (tooltipAbove < 0 ? hovered.y + 14 : tooltipAbove) : 0

  const labelIndices = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]))

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full touch-none select-none"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: LINE_COLOR, stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: LINE_COLOR, stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {gridLevels.map((g) => {
        const gy = PADDING.top + PLOT_HEIGHT * (1 - g)
        return (
          <g key={g}>
            <line
              x1={PADDING.left}
              y1={gy}
              x2={WIDTH - PADDING.right}
              y2={gy}
              strokeWidth={1}
              strokeDasharray={g === 0 ? undefined : '4 4'}
              style={{ stroke: GRID_COLOR }}
            />
            <text
              x={PADDING.left - 8}
              y={gy}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight={600}
              style={{ fill: LABEL_COLOR }}
            >
              {formatValue(yMin + (yMax - yMin) * g)}
            </text>
          </g>
        )
      })}

      {points.length > 1 && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path
        d={linePath}
        fill="none"
        strokeWidth={2.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: LINE_COLOR }}
      />
      {coords.map((p) => (
        <circle key={p.date} cx={p.x} cy={p.y} r={3.5} style={{ fill: LINE_COLOR, stroke: 'var(--c-surface)' }} strokeWidth={1.5} />
      ))}

      {labelIndices.map((i, n) => (
        <text
          key={i}
          x={coords[i].x}
          y={HEIGHT - 6}
          textAnchor={labelIndices.length === 1 ? 'middle' : n === 0 ? 'start' : n === labelIndices.length - 1 ? 'end' : 'middle'}
          fontSize={10}
          fontWeight={600}
          style={{ fill: LABEL_COLOR }}
        >
          {formatShortDate(points[i].date)}
        </text>
      ))}

      {hovered && (
        <g>
          <line
            x1={hovered.x}
            y1={PADDING.top}
            x2={hovered.x}
            y2={baseline}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            style={{ stroke: 'var(--c-faint)' }}
          />
          <circle cx={hovered.x} cy={hovered.y} r={6} strokeWidth={3} style={{ fill: LINE_COLOR, stroke: 'var(--c-surface)' }} />
          <g transform={`translate(${tooltipX}, ${tooltipY})`}>
            <rect width={tooltipWidth} height={tooltipHeight} rx={12} style={{ fill: 'var(--c-coach)' }} />
            <text x={tooltipWidth / 2} y={14} textAnchor="middle" fontSize={10} fontWeight={500} fill="#d4d4d8">
              {formatShortDate(hovered.date)}
            </text>
            <text x={tooltipWidth / 2} y={27} textAnchor="middle" fontSize={11} fontWeight={800} fill="white">
              {formatValue(hovered.value)}
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}
