import { useId, useRef, useState, type MouseEvent } from 'react'
import type { DayVolume } from '../../utils/dailyActivity'

interface ActivityLineChartProps {
  series: DayVolume[]
}

const WIDTH = 640
const HEIGHT = 320
const PADDING = { top: 10, right: 10, bottom: 24, left: 40 }
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom
const LINE_COLOR = '#4f46e5' // indigo-600, the app's existing brand/primary color

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

  const tooltipWidth = 96
  const tooltipX = hovered ? Math.min(Math.max(hovered.x - tooltipWidth / 2, 0), WIDTH - tooltipWidth) : 0

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
          <stop offset="0%" stopColor={LINE_COLOR} stopOpacity="0.25" />
          <stop offset="100%" stopColor={LINE_COLOR} stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g) => {
        const gy = PADDING.top + PLOT_HEIGHT * (1 - g)
        return (
          <g key={g}>
            <line x1={PADDING.left} y1={gy} x2={WIDTH - PADDING.right} y2={gy} stroke="#e5e7eb" strokeWidth={1} />
            <text x={PADDING.left - 6} y={gy} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9ca3af">
              {formatVolume(maxVolume * g)}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {labelIndices.map((i) => (
        <text key={i} x={x(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">
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
            stroke="#c7d2fe"
            strokeWidth={1}
          />
          <circle cx={hovered.x} cy={hovered.y} r={4} fill={LINE_COLOR} stroke="white" strokeWidth={1.5} />
          <g transform={`translate(${tooltipX}, ${Math.max(hovered.y - 34, PADDING.top)})`}>
            <rect width={tooltipWidth} height={28} rx={6} fill="#111827" opacity={0.9} />
            <text x={tooltipWidth / 2} y={11} textAnchor="middle" fontSize={9} fill="white">
              {formatShortDate(hovered.date)}
            </text>
            <text x={tooltipWidth / 2} y={22} textAnchor="middle" fontSize={9} fontWeight="bold" fill="white">
              {formatVolume(hovered.volume)} vol
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}
