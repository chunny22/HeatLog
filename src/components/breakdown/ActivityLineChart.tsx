import { useId, useRef, useState, type MouseEvent } from 'react'
import type { DayVolume } from '../../utils/dailyActivity'

interface ActivityLineChartProps {
  series: DayVolume[]
}

const WIDTH = 640
const HEIGHT = 320
const PADDING = { top: 14, right: 10, bottom: 26, left: 40 }
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom
// Theme colours (see index.css). SVG presentation attributes can't read CSS
// variables, so these are applied through the style prop.
const LINE_COLOR = 'var(--c-accent)'
const GRID_COLOR = 'var(--c-line)'
const LABEL_COLOR = 'var(--c-muted)'

function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatVolume(v: number): string {
  return Math.round(v).toLocaleString()
}

export function ActivityLineChart({ series }: ActivityLineChartProps) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const maxVolume = Math.max(...series.map((d) => d.volume), 1)

  const x = (i: number) => PADDING.left + (series.length === 1 ? 0 : (i / (series.length - 1)) * PLOT_WIDTH)
  const y = (v: number) => PADDING.top + PLOT_HEIGHT - (v / maxVolume) * PLOT_HEIGHT

  const points = series.map((d, i) => ({ x: x(i), y: y(d.volume), ...d }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const baseline = PADDING.top + PLOT_HEIGHT
  const areaPath = `${linePath} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`

  const handleMove = (e: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return

    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(ctm.inverse())

    const ratio = (local.x - PADDING.left) / PLOT_WIDTH
    const index = Math.round(ratio * (series.length - 1))
    setHoverIndex(Math.min(series.length - 1, Math.max(0, index)))
  }

  const gridLines = [0, 0.5, 1]
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  const tooltipWidth = 104
  const tooltipHeight = 36
  const tooltipX = hovered ? Math.min(Math.max(hovered.x - tooltipWidth / 2, 0), WIDTH - tooltipWidth) : 0
  // Above the point, or below it when there's no room at the top.
  const tooltipAbove = hovered ? hovered.y - tooltipHeight - 12 : 0
  const tooltipY = hovered ? (tooltipAbove < 0 ? hovered.y + 14 : tooltipAbove) : 0

  // A handful of evenly-spaced x-axis labels -- all 30 would be too crowded.
  const labelCount = Math.min(5, series.length)
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i / (labelCount - 1)) * (series.length - 1)),
  )

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

      {gridLines.map((g) => {
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
              {formatVolume(maxVolume * g)}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        strokeWidth={2.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: LINE_COLOR }}
      />

      {labelIndices.map((i, n) => (
        <text
          key={i}
          x={x(i)}
          y={HEIGHT - 6}
          // The outer labels sit on the chart edges, so anchor them inward to avoid clipping.
          textAnchor={n === 0 ? 'start' : n === labelIndices.length - 1 ? 'end' : 'middle'}
          fontSize={10}
          fontWeight={600}
          style={{ fill: LABEL_COLOR }}
        >
          {formatShortDate(series[i].date)}
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
          <circle
            cx={hovered.x}
            cy={hovered.y}
            r={6}
            strokeWidth={3}
            style={{ fill: LINE_COLOR, stroke: 'var(--c-surface)' }}
          />
          <g transform={`translate(${tooltipX}, ${tooltipY})`}>
            <rect width={tooltipWidth} height={tooltipHeight} rx={12} style={{ fill: 'var(--c-coach)' }} />
            <text x={tooltipWidth / 2} y={14} textAnchor="middle" fontSize={10} fontWeight={500} fill="#d4d4d8">
              {formatShortDate(hovered.date)}
            </text>
            <text x={tooltipWidth / 2} y={27} textAnchor="middle" fontSize={11} fontWeight={800} fill="white">
              {formatVolume(hovered.volume)} vol
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}
