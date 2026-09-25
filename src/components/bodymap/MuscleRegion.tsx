import { MUSCLE_LABELS } from '../../data/muscles'
import type { MuscleGroup } from '../../types'
import { muscleColor } from '../../utils/colorScale'

export interface RegionShape {
  muscle: MuscleGroup
  x: number
  y: number
  width: number
  height: number
  rx?: number
}

interface MuscleRegionProps {
  shape: RegionShape
  normalizedVolume: number
  rawVolume: number
}

export function MuscleRegion({ shape, normalizedVolume, rawVolume }: MuscleRegionProps) {
  return (
    <g>
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={shape.rx ?? Math.min(shape.width, shape.height) / 2}
        // style (not attributes) so the colours can be theme CSS variables
        style={{ fill: muscleColor(normalizedVolume), stroke: 'var(--c-inset)' }}
        strokeWidth={1.5}
      >
        <title>
          {`${MUSCLE_LABELS[shape.muscle]}: ${Math.round(rawVolume).toLocaleString()} vol`}
        </title>
      </rect>
    </g>
  )
}
